import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ExamRunner } from "@/components/exam/exam-runner";
import { requireSession } from "@/lib/auth-guard";
import {
  coursesCol,
  examAttemptsCol,
  examQuestionsCol,
  examsCol,
} from "@/lib/collections";
import { checkExamAccess } from "@/lib/exam-access";
import { getActiveExam } from "@/lib/exam-lock";
import { checkExamWindow } from "@/lib/exam-window";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Take exam — LegalPath Bangladesh",
};

export default async function UnifiedExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/exam/${id}`)}`);
  }
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const examId = new ObjectId(id);
  const exam = await (await examsCol()).findOne({ _id: examId });
  if (!exam) {
    notFound();
  }

  const course = await (await coursesCol()).findOne({ _id: exam.courseId });
  if (!course) {
    notFound();
  }

  const userId = new ObjectId(session.userId);
  const access = await checkExamAccess(userId, exam, course);
  const activeExam = await getActiveExam(userId);
  const resumeHref = activeExam?.unified
    ? `/exam/${activeExam.examId}`
    : activeExam?.kind === "written"
      ? `/exam/written/${activeExam.examId}`
      : activeExam?.kind === "free"
        ? `/exam/free/${activeExam.examId}`
        : activeExam
          ? `/exam/preliminary/${activeExam.examId}`
          : null;

  if (activeExam && !activeExam.examId.equals(examId)) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16">
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-primary">
            Another exam is in progress.
          </h1>
          <p className="mt-3 text-sm text-muted">
            Resume the active exam before starting another one.
          </p>
          {resumeHref ? (
            <Link
              href={resumeHref}
              className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm text-cream"
            >
              Resume exam
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  if (!access.allowed) {
    const message =
      access.reason === "enrollment-pending"
        ? "Your enrollment is awaiting approval."
        : access.reason === "enrollment-rejected"
          ? "Your enrollment request was rejected."
          : access.reason === "quota-exhausted"
            ? "You have used all free exam attempts."
            : access.reason === "outside-window"
              ? "This exam is outside its availability window."
              : access.reason === "not-published"
                ? "This exam is not available."
                : "Enroll in the linked course to access this exam.";

    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16">
        <div className="w-full rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-primary">
            Exam unavailable
          </h1>
          <p className="mt-3 text-sm text-muted">{message}</p>
          <Link
            href={`/courses/${course.slug}`}
            className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm text-cream"
          >
            View course
          </Link>
        </div>
      </main>
    );
  }

  const window = checkExamWindow(exam);
  if (!window.open) {
    notFound();
  }

  const [questions, attempt] = await Promise.all([
    (await examQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray(),
    activeExam?.unified
      ? (await examAttemptsCol()).findOne({
          _id: activeExam.attemptId,
          examId,
          userId,
          activeLock: true,
          status: "in-progress",
        })
      : Promise.resolve(null),
  ]);

  return (
    <ExamRunner
      key={examId.toString()}
      exam={{
        id: examId.toString(),
        kind: exam.kind,
        unified: true,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        questionsPerAttempt: exam.questionsPerAttempt,
        negativeMarking: exam.negativeMarking,
        passMarkPercent: exam.passMarkPercent,
        hasWrittenQuestions: exam.kind === "written",
      }}
      questions={questions.map((question, position) => ({
        id: question._id.toString(),
        position,
        source: "exam_questions" as const,
        questionText: question.questionText,
        options: question.options,
        marks: question.marks,
        maxMarks: question.maxMarks,
        subject: question.subject ?? "General",
      }))}
      attempt={
        attempt
          ? {
              id: attempt._id.toString(),
              startedAt: attempt.startedAt.toISOString(),
              expiresAt: attempt.expiresAt.toISOString(),
              shuffledOrder: attempt.shuffledOrder,
              answers: attempt.answers.map((answer) => ({
                questionId: answer.questionId.toString(),
                selectedOptionIndex: answer.selectedOptionIndex,
                answeredAt: answer.answeredAt?.toISOString() ?? null,
                pdfUrl: answer.pdfUrl ?? null,
                pdfPublicId: answer.pdfPublicId ?? null,
                uploadedAt: answer.answeredAt?.toISOString() ?? null,
              })),
              perQuestionAnswers:
                exam.kind === "written"
                  ? attempt.answers.map((answer) => ({
                      questionId: answer.questionId.toString(),
                      pdfUrl: answer.pdfUrl ?? null,
                      pdfPublicId: answer.pdfPublicId ?? null,
                      uploadedAt: answer.answeredAt?.toISOString() ?? null,
                    }))
                  : undefined,
            }
          : null
      }
    />
  );
}
