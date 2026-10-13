import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import {
  StudentExamsClient,
  type StudentExam,
} from "@/components/dashboard/student-exams-client";
import { requireSession } from "@/lib/auth-guard";
import type { Exam } from "@/lib/types/exam";
import {
  coursesCol,
  enrollmentsCol,
  examAttemptsCol,
  examsCol,
} from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import { getFreeAttemptStatus } from "@/lib/exam-quota";

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
  const [publishedExams, enrollments, attempts, activeExam, quota] =
    await Promise.all([
      (await examsCol())
        .find({ status: "published" })
        .sort({ scheduledAt: 1, order: 1, createdAt: -1 })
        .toArray(),
      (await enrollmentsCol()).find({ userId }).toArray(),
      (await examAttemptsCol()).find({ userId }).toArray(),
      getActiveExam(userId),
      getFreeAttemptStatus(userId),
    ]);

  const courseIds = [
    ...new Set(publishedExams.map((exam) => exam.courseId.toString())),
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

  for (const attempt of attempts) {
    if (attempt.status === "in-progress") {
      continue;
    }

    const examId = attempt.examId.toString();
    const exam = publishedExams.find(
      (item: (typeof publishedExams)[number]) => item._id.toString() === examId,
    );
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

  const studentExams: StudentExam[] = publishedExams.flatMap((exam: Exam) => {
    const course = coursesById.get(exam.courseId.toString());
    const segments = (course?.segments ?? []) as Array<{
      _id: ObjectId;
      title: string;
      subSegments: Array<{ _id: ObjectId; title: string }>;
    }>;
    const segment = segments.find(
      (item) => item._id.toString() === exam.segmentId.toString(),
    );
    const subSegment = segment?.subSegments.find(
      (item) => item._id.toString() === exam.subSegmentId.toString(),
    );

    if (!course || !segment || !subSegment) {
      return [];
    }

    const storedEnrollmentStatus = enrollmentsByCourse.get(
      course._id.toString()
    );
    const enrollmentStatus =
      course.type === "free"
        ? "approved"
        : storedEnrollmentStatus === "approved" ||
            storedEnrollmentStatus === "pending" ||
            storedEnrollmentStatus === "rejected"
          ? storedEnrollmentStatus
          : "none";

    return [
      {
        id: exam._id.toString(),
        kind: exam.kind,
        status: "published",
        title: exam.title,
        description: exam.description,
        thumbnailUrl: exam.thumbnailUrl ?? course.coverUrl ?? null,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        questionsPerAttempt: exam.questionsPerAttempt,
        isFree: course.type === "free",
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
