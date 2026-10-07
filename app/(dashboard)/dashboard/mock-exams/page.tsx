import type { Metadata } from "next";
import { ObjectId } from "mongodb";

import { ActiveExamBanner } from "@/components/dashboard/active-exam-banner";
import { MockExamsHeader } from "@/components/dashboard/mock-exams-header";
import { MockExamsFilter } from "@/components/dashboard/mock-exams-filter";
import { MockExamsGrid } from "@/components/dashboard/mock-exams-grid";
import { requireSession } from "@/lib/auth-guard";
import {
  enrollmentsCol,
  freeTestAttemptsCol,
  preliminaryAttemptsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import { listUnifiedExams } from "@/lib/exams-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Model Tests — BJS Prep",
  description: "Browse your paid and free model tests.",
};

export default async function DashboardMockExamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    kind?: "all" | "preliminary" | "written" | "free";
  }>;
}) {
  const session = await requireSession();

  if (!session) {
    return null;
  }

  const userId = new ObjectId(session.userId);
  const params = await searchParams;
  const [
    result,
    activeExam,
    enrollments,
    preliminaryAttempts,
    writtenAttempts,
    freeAttempts,
  ] = await Promise.all([
    listUnifiedExams({
      scope: "all",
      search: params.search,
      kind: params.kind,
      page: 1,
      limit: 100,
    }),
    getActiveExam(userId),
    (await enrollmentsCol()).find({ userId }).toArray(),
    (await preliminaryAttemptsCol()).find({ userId }).toArray(),
    (await writtenSubmissionsCol()).find({ userId }).toArray(),
    (await freeTestAttemptsCol()).find({ userId }).toArray(),
  ]);

  const enrollmentMap: Record<
    string,
    "approved" | "pending" | "rejected" | "none"
  > = {};

  for (const enrollment of enrollments) {
    const key = enrollment.courseId.toString();
    enrollmentMap[key] =
      enrollment.status === "approved"
        ? "approved"
        : enrollment.status === "pending"
          ? "pending"
          : enrollment.status === "rejected"
            ? "rejected"
            : "none";
  }

  const attemptMap: Record<
    string,
    { attempts: number; bestScore: number | null }
  > = {};

  function recordAttempt(examId: string, percent: number | null) {
    const current = attemptMap[examId] ?? { attempts: 0, bestScore: null };
    current.attempts += 1;

    if (percent !== null && Number.isFinite(percent)) {
      current.bestScore =
        current.bestScore === null
          ? Math.round(percent)
          : Math.max(current.bestScore, Math.round(percent));
    }

    attemptMap[examId] = current;
  }

  for (const attempt of preliminaryAttempts) {
    if (attempt.status === "in-progress") {
      continue;
    }

    const examId = attempt.examId.toString();
    const exam = result.exams.find((item) => item.id === examId);
    const percentage =
      exam && exam.totalMarks > 0
        ? (attempt.score / exam.totalMarks) * 100
        : null;
    recordAttempt(examId, percentage);
  }

  for (const submission of writtenAttempts) {
    if (submission.status === "in-progress") {
      continue;
    }

    const percentage =
      submission.maxScore > 0
        ? (submission.totalScore / submission.maxScore) * 100
        : null;
    recordAttempt(submission.examId.toString(), percentage);
  }

  for (const attempt of freeAttempts) {
    if (attempt.status === "in-progress") {
      continue;
    }

    const examId = attempt.freeTestId.toString();
    const exam = result.exams.find((item) => item.id === examId);
    const percentage =
      exam && exam.totalMarks > 0
        ? (attempt.score / exam.totalMarks) * 100
        : null;
    recordAttempt(examId, percentage);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {activeExam ? (
        <ActiveExamBanner
          active={activeExam}
          examTitle={
            activeExam.kind === "free"
              ? "Free model test"
              : activeExam.kind === "written"
                ? "Written model test"
                : "Preliminary model test"
          }
        />
      ) : null}
      <MockExamsHeader />
      <MockExamsFilter />
      <MockExamsGrid
        exams={result.exams}
        attemptMap={attemptMap}
        enrollmentMap={enrollmentMap}
      />
    </div>
  );
}
