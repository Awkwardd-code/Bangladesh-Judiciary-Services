import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import {
  DashboardHomeClient,
  type DashboardHomeData,
} from "@/components/dashboard/dashboard-home-client";
import { requireSession } from "@/lib/auth-guard";
import {
  coursesCol,
  enrollmentsCol,
  examAttemptsCol,
  examQuestionsCol,
  examsCol,
  noticesCol,
  usersCol,
} from "@/lib/collections";
import { getFreeAttemptStatus } from "@/lib/exam-quota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — LegalPath Bangladesh",
  description: "Your LegalPath Bangladesh account and learning activity.",
};

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login?next=%2Fdashboard");
  }

  const userId = new ObjectId(session.userId);
  const [user, enrollments, attempts, notices, quota] = await Promise.all([
    (await usersCol()).findOne({ _id: userId }),
    (await enrollmentsCol())
      .find({ userId, status: { $in: ["approved", "pending"] } })
      .sort({ createdAt: -1 })
      .toArray(),
    (await examAttemptsCol())
      .find({
        userId,
        status: { $in: ["submitted", "graded", "auto-submitted", "expired"] },
      })
      .sort({ submittedAt: -1 })
      .toArray(),
    (await noticesCol())
      .find({
        status: "published",
        audience: { $in: ["all", "students", "university"] },
      })
      .sort({ pinned: -1, publishedAt: -1, createdAt: -1 })
      .limit(3)
      .toArray(),
    getFreeAttemptStatus(userId),
  ]);

  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  const enrolledCourseIds = [
    ...new Set(enrollments.map((enrollment) => enrollment.courseId.toString())),
  ].map((id) => new ObjectId(id));
  const attemptExamIds = [
    ...new Set(attempts.map((attempt) => attempt.examId.toString())),
  ].map((id) => new ObjectId(id));
  const [courses, attemptExams] = await Promise.all([
    enrolledCourseIds.length
      ? (await coursesCol()).find({ _id: { $in: enrolledCourseIds } }).toArray()
      : Promise.resolve([]),
    attemptExamIds.length
      ? (await examsCol()).find({ _id: { $in: attemptExamIds } }).toArray()
      : Promise.resolve([]),
  ]);
  const questionIds = [
    ...new Set(
      attempts.flatMap((attempt) =>
        attempt.answers.map((answer) => answer.questionId.toString())
      )
    ),
  ].map((id) => new ObjectId(id));
  const answeredQuestions = questionIds.length
    ? await (
        await examQuestionsCol()
      )
        .find({ _id: { $in: questionIds } })
        .toArray()
    : [];

  const courseById = new Map(
    courses.map((course) => [course._id.toString(), course])
  );
  const examById = new Map(
    attemptExams.map((exam) => [exam._id.toString(), exam])
  );
  const questionById = new Map(
    answeredQuestions.map((question) => [question._id.toString(), question])
  );
  const attemptMaxMarks = (attempt: (typeof attempts)[number]) => {
    const exam = examById.get(attempt.examId.toString());
    if (!exam) return 0;
    return attempt.answers.reduce((total, answer) => {
      const question = questionById.get(answer.questionId.toString());
      if (!question) return total;
      return (
        total +
        (exam.kind === "written"
          ? (question.maxMarks ?? question.marks)
          : question.marks)
      );
    }, 0);
  };
  const approvedEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "approved"
  );
  const courseCards = approvedEnrollments
    .flatMap((enrollment) => {
      const course = courseById.get(enrollment.courseId.toString());
      return course
        ? [
            {
              id: course._id.toString(),
              title: course.title,
              slug: course.slug,
              category: course.category,
              programKind: course.programKind ?? "course",
              coverUrl: course.coverUrl ?? null,
              durationLabel: course.durationLabel,
            },
          ]
        : [];
    })
    .slice(0, 3);

  const submittedAttempts = attempts.filter(
    (attempt) =>
      attempt.status === "submitted" ||
      attempt.status === "graded" ||
      attempt.status === "auto-submitted"
  );
  const bestScore = submittedAttempts.reduce<number | null>((best, attempt) => {
    const totalMarks = attemptMaxMarks(attempt);
    if (totalMarks <= 0) return best;
    const percent = Math.round((attempt.score / totalMarks) * 100);
    return best === null ? percent : Math.max(best, percent);
  }, null);
  const recentAttempts = attempts.slice(0, 5).flatMap((attempt) => {
    const exam = examById.get(attempt.examId.toString());
    if (!exam) return [];
    const isWrittenAwaitingReview =
      exam.kind === "written" && attempt.status === "submitted";
    const maxMarks = attemptMaxMarks(attempt);
    const scorePercent =
      maxMarks > 0 ? Math.round((attempt.score / maxMarks) * 100) : null;

    return [
      {
        id: attempt._id.toString(),
        examId: exam._id.toString(),
        title: exam.title,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        scorePercent: isWrittenAwaitingReview ? null : scorePercent,
        status: isWrittenAwaitingReview
          ? "Under review"
          : attempt.status === "expired"
            ? "Expired"
            : "Submitted",
        href: `/dashboard/exams/${exam._id.toString()}/result?attemptId=${attempt._id.toString()}`,
      },
    ];
  });

  const data: DashboardHomeData = {
    name: user.name,
    today: new Intl.DateTimeFormat("en", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date()),
    stats: {
      enrolledCourses: approvedEnrollments.length,
      examsTaken: submittedAttempts.length,
      bestScore,
      freeAttemptsRemaining: quota.remaining,
      freeAttemptLimit: quota.limit,
    },
    courses: courseCards,
    recentAttempts,
    notices: notices.map((notice) => ({
      id: notice._id.toString(),
      title: notice.title,
      excerpt: notice.excerpt,
      publishedAt:
        notice.publishedAt?.toISOString() ?? notice.createdAt.toISOString(),
      pinned: notice.pinned,
    })),
  };

  return <DashboardHomeClient data={data} />;
}
