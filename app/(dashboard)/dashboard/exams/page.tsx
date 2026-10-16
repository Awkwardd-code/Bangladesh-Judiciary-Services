import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import {
  StudentExamsClient,
  type StudentExam,
} from "@/components/dashboard/student-exams-client";
import { requireSession } from "@/lib/auth-guard";
import {
  coursesCol,
  enrollmentsCol,
  examAttemptsCol,
  examsCol,
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  writtenExamsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { isExamLocked } from "@/lib/exam-readiness";
import { getActiveExam } from "@/lib/exam-lock";
import { getFreeAttemptStatus } from "@/lib/exam-quota";

type DashboardExamRecord = {
  _id: ObjectId;
  title: string;
  description?: string;
  kind: "preliminary" | "written";
  source: "unified" | "preliminary" | "written";
  courseId?: ObjectId | null;
  segmentId?: ObjectId | null;
  topicId?: ObjectId | null;
  subSegmentId?: ObjectId | null;
  type?: "free" | "paid";
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  isLocked?: boolean;
  thumbnailUrl?: string;
  scheduledAt?: Date | null;
  closesAt?: Date | null;
};

type AttemptSummaryRow = {
  examId: ObjectId;
  status: string;
  score: number;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Take a Test — LegalPath Bangladesh",
  description: "Take preliminary and written tests from your enrolled courses and model test batches.",
};

export default async function DashboardExamsPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login?next=%2Fdashboard%2Fexams");
  }

  const userId = new ObjectId(session.userId);
  const [
    unifiedExams,
    preliminaryExams,
    writtenExams,
    enrollments,
    attempts,
    preliminaryAttempts,
    writtenSubmissions,
    activeExam,
    quota,
  ] =
    await Promise.all([
      (await examsCol())
        .find({ status: "published" })
        .sort({ scheduledAt: 1, order: 1, createdAt: -1 })
        .toArray(),
      (await preliminaryExamsCol())
        .find({ status: "published" })
        .sort({ createdAt: -1 })
        .toArray(),
      (await writtenExamsCol())
        .find({ status: "published" })
        .sort({ createdAt: -1 })
        .toArray(),
      (await enrollmentsCol()).find({ userId }).toArray(),
      (await examAttemptsCol()).find({ userId }).toArray(),
      (await preliminaryAttemptsCol()).find({ userId }).toArray(),
      (await writtenSubmissionsCol()).find({ userId }).toArray(),
      getActiveExam(userId),
      getFreeAttemptStatus(userId),
    ]);

  const publishedExams: DashboardExamRecord[] = [
    ...unifiedExams.map((exam) => ({
      ...exam,
      kind: exam.kind,
      source: "unified" as const,
    })),
    ...preliminaryExams.map((exam) => ({
      ...exam,
      kind: "preliminary" as const,
      source: "preliminary" as const,
    })),
    ...writtenExams.map((exam) => ({
      ...exam,
      kind: "written" as const,
      source: "written" as const,
    })),
  ];

  const courseIds = [
    ...new Set(
      publishedExams.flatMap((exam) =>
        exam.courseId ? [exam.courseId.toString()] : [],
      ),
    ),
  ].map((id) => new ObjectId(id));
  const courses =
    courseIds.length > 0
      ? await (await coursesCol()).find({ _id: { $in: courseIds } }).toArray()
      : [];
  const coursesById = new Map(
    courses.map((course) => [course._id.toString(), course])
  );
  const enrollmentsByCourse = new Map(
    enrollments.map((enrollment) => [
      enrollment.courseId.toString(),
      enrollment.status,
    ])
  );
  const attemptsByExam = new Map<
    string,
    { attempts: number; bestScore: number | null }
  >();

  const attemptSummaryRows: AttemptSummaryRow[] = [
    ...attempts.map((attempt) => ({
      examId: attempt.examId,
      status: attempt.status,
      score: attempt.score,
    })),
    ...preliminaryAttempts.map((attempt) => ({
      examId: attempt.examId,
      status: attempt.status,
      score: attempt.score,
    })),
    ...writtenSubmissions.map((submission) => ({
      examId: submission.examId,
      status: submission.status,
      score: submission.totalScore,
    })),
  ];
  const publishedExamsById = new Map(
    publishedExams.map((exam) => [exam._id.toString(), exam]),
  );

  for (const attempt of attemptSummaryRows) {
    if (
      attempt.status === "in-progress" ||
      attempt.status === "under-review"
    ) {
      continue;
    }

    const examId = attempt.examId.toString();
    const exam = publishedExamsById.get(examId);
    const score =
      exam && exam.totalMarks > 0
        ? Math.round((attempt.score / exam.totalMarks) * 100)
        : null;
    const current = attemptsByExam.get(examId) ?? {
      attempts: 0,
      bestScore: null,
    };
    current.attempts += 1;
    if (score !== null) {
      current.bestScore =
        current.bestScore === null ? score : Math.max(current.bestScore, score);
    }
    attemptsByExam.set(examId, current);
  }

  const studentExams: StudentExam[] = publishedExams.flatMap((exam) => {
    if (!exam.courseId) return [];
    const course = coursesById.get(exam.courseId.toString());
    const segments = (course?.segments ?? []) as Array<{
      _id: ObjectId;
      title: string;
      order: number;
      subSegments: Array<{ _id: ObjectId; title: string }>;
    }>;
    const segmentForSubSegment = segments.find((item) =>
      item.subSegments.some(
        (subSegment) =>
          exam.subSegmentId &&
          subSegment._id.toString() === exam.subSegmentId.toString(),
      ),
    );
    const topicSegment = exam.topicId
      ? segments.find((item) =>
          course?.topics?.some(
            (topic) =>
              topic._id.equals(exam.topicId!) && topic.order === item.order,
          ),
        )
      : undefined;
    const segment =
      (exam.segmentId
        ? segments.find(
            (item) => item._id.toString() === exam.segmentId!.toString(),
          )
        : undefined) ??
      segmentForSubSegment ??
      topicSegment;
    const subSegment = segment?.subSegments.find(
      (item) =>
        (exam.subSegmentId &&
          item._id.toString() === exam.subSegmentId.toString()) ||
        (!exam.subSegmentId && item.title === exam.title),
    );

    if (!course || !segment || !subSegment) {
      return [];
    }

    const storedEnrollmentStatus = enrollmentsByCourse.get(
      course._id.toString()
    );
    const enrollmentStatus =
      course.type === "free" || exam.type === "free"
        ? "approved"
        : storedEnrollmentStatus === "approved" ||
            storedEnrollmentStatus === "pending" ||
            storedEnrollmentStatus === "rejected"
          ? storedEnrollmentStatus
          : "none";

    return [
      {
        id: exam._id.toString(),
        source: exam.source,
        kind: exam.kind,
        href:
          exam.source === "written"
            ? `/exam/written/${exam._id}`
            : exam.source === "preliminary"
              ? `/exam/preliminary/${exam._id}`
              : `/exam/${exam._id}`,
        status: "published",
        title: exam.title,
        description: exam.description ?? "",
        thumbnailUrl: exam.thumbnailUrl ?? course.coverUrl ?? null,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        questionsPerAttempt:
          exam.questionsPerAttempt || exam.totalQuestions,
        isLocked:
          Boolean(exam.isLocked) ||
          isExamLocked(exam.totalQuestions, exam.questionsPerAttempt),
        isFree: course.type === "free" || exam.type === "free",
        price: course.price,
        courseId: course._id.toString(),
        courseTitle: course.title,
        courseSlug: course.slug,
        courseCategory: course.category,
        segmentTitle: segment.title,
        subSegmentTitle: subSegment.title,
        scheduledAt: exam.scheduledAt?.toISOString() ?? null,
        closesAt: exam.closesAt?.toISOString() ?? null,
        attempt: attemptsByExam.get(exam._id.toString()) ?? null,
        enrollment: enrollmentStatus,
      },
    ];
  });

  return (
    <StudentExamsClient
      exams={studentExams}
      activeExam={activeExam}
      quota={quota}
    />
  );
}
