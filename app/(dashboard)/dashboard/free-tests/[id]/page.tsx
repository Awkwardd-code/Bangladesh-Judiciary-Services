import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ExamRunner } from "@/components/dashboard/exam-runner";
import { FreeTestLockedCard } from "@/components/dashboard/free-test-locked-card";
import { requireSession } from "@/lib/auth-guard";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { getActiveExam } from "@/lib/exam-lock";
import { getFreeTestAccess } from "@/lib/free-test-quota";
import type { ActiveExam } from "@/lib/types/exam";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Model Test — BJS Prep",
};

export default async function StudentFreeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect(
      `/login?next=${encodeURIComponent(`/dashboard/free-tests/${(await params).id}`)}`
    );
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const freeTestId = new ObjectId(id);
  const userId = new ObjectId(session.userId);

  const freeTest = await (
    await freeTestsCol()
  ).findOne({
    _id: freeTestId,
    status: "published",
  });

  if (!freeTest) {
    notFound();
  }

  const hasPreliminaryQuestions = (freeTest.questions ?? []).some(
    (reference) => reference.sourceCollection === "preliminary_questions"
  );
  const hasWrittenQuestions = (freeTest.questions ?? []).some(
    (reference) => reference.sourceCollection === "written_questions"
  );
  const hasExplicitPhaseDurations =
    typeof freeTest.preliminaryDurationMinutes === "number" ||
    typeof freeTest.writtenDurationMinutes === "number";
  const preliminaryQuestionCount = (freeTest.questions ?? []).filter(
    (reference) => reference.sourceCollection === "preliminary_questions"
  ).length;
  const writtenQuestionCount = (freeTest.questions ?? []).filter(
    (reference) => reference.sourceCollection === "written_questions"
  ).length;
  const effectiveDurationMinutes = hasExplicitPhaseDurations
    ? (hasPreliminaryQuestions
        ? (freeTest.preliminaryDurationMinutes ?? 0)
        : 0) +
      (hasWrittenQuestions ? (freeTest.writtenDurationMinutes ?? 0) : 0)
    : freeTest.durationMinutes;

  const access = await getFreeTestAccess(userId);
  const active = await getActiveExam(userId);

  if (active && active.examId.toString() !== freeTestId.toString()) {
    return <ActiveExamBlockedCard active={active} />;
  }

  if (active && active.kind === "free" && active.examId.equals(freeTestId)) {
    const attempt = await (
      await freeTestAttemptsCol()
    ).findOne({
      _id: active.attemptId,
      userId,
      freeTestId,
      activeLock: true,
    });

    if (!attempt) {
      return (
        <ExamRunner
          key={freeTest._id.toString()}
          exam={{
            id: freeTest._id.toString(),
            kind: "free",
            title: freeTest.title,
            durationMinutes: effectiveDurationMinutes,
            preliminaryDurationMinutes:
              freeTest.preliminaryDurationMinutes ?? freeTest.durationMinutes,
            writtenDurationMinutes: freeTest.writtenDurationMinutes ?? 0,
            writtenQuestionsPerAttempt:
              freeTest.writtenQuestionsPerAttempt ?? 0,
            totalQuestions: freeTest.totalQuestions,
            preliminaryQuestionCount,
            writtenQuestionCount,
            totalMarks: freeTest.totalMarks,
            questionsPerAttempt: freeTest.questionsPerAttempt,
            passMarkPercent: freeTest.passMarkPercent,
            hasWrittenQuestions:
              freeTest.questions?.some(
                (reference) =>
                  reference.sourceCollection === "written_questions"
              ) ?? false,
          }}
          attempt={null}
          questions={null}
        />
      );
    }

    const questionList = await Promise.all(
      attempt.answers.map(async (answer, position) => {
        const reference = (freeTest.questions ?? []).find((entry) =>
          entry.questionId.equals(answer.questionId)
        );
        const sourceCollection =
          answer.sourceCollection ??
          reference?.sourceCollection ??
          "preliminary_questions";
        const collection =
          sourceCollection === "preliminary_questions"
            ? await preliminaryQuestionsCol()
            : await writtenQuestionsCol();

        const question = await collection.findOne({
          _id: answer.questionId,
        });

        if (!question) {
          return null;
        }

        if ("correctOptionIndex" in question) {
          return {
            id: question._id.toString(),
            position,
            source: "preliminary_questions" as const,
            questionText: question.questionText,
            options: question.options,
            marks: answer.marks ?? reference?.marks ?? question.marks,
            maxMarks: "maxMarks" in question ? question.maxMarks : undefined,
            subject: question.subject ?? "General",
          };
        }

        return {
          id: question._id.toString(),
          position,
          source: "written_questions" as const,
          questionText: question.questionText,
          options: undefined,
          marks: answer.marks ?? reference?.marks ?? question.maxMarks,
          maxMarks: question.maxMarks,
          subject: question.subject ?? "General",
        };
      })
    );

    const validQuestions = questionList.filter(Boolean) as Array<{
      id: string;
      position: number;
      source: "preliminary_questions" | "written_questions";
      questionText: string;
      options?: string[];
      marks: number;
      maxMarks?: number;
      subject: string;
    }>;
    const orderedQuestions = attempt.answers
      .map((answer) =>
        validQuestions.find(
          (question) => question.id === answer.questionId.toString()
        )
      )
      .filter((question) => question !== undefined);

    return (
      <ExamRunner
        key={freeTest._id.toString()}
        exam={{
          id: freeTest._id.toString(),
          kind: "free",
          title: freeTest.title,
          durationMinutes: effectiveDurationMinutes,
          preliminaryDurationMinutes:
            freeTest.preliminaryDurationMinutes ?? freeTest.durationMinutes,
          writtenDurationMinutes: freeTest.writtenDurationMinutes ?? 0,
          writtenQuestionsPerAttempt: freeTest.writtenQuestionsPerAttempt ?? 0,
          totalQuestions: freeTest.totalQuestions,
          preliminaryQuestionCount,
          writtenQuestionCount,
          totalMarks: freeTest.totalMarks,
          questionsPerAttempt: freeTest.questionsPerAttempt,
          passMarkPercent: freeTest.passMarkPercent,
          hasWrittenQuestions:
            freeTest.questions?.some(
              (reference) => reference.sourceCollection === "written_questions"
            ) ?? false,
        }}
        attempt={{
          id: attempt._id.toString(),
          startedAt: attempt.startedAt.toISOString(),
          expiresAt: attempt.expiresAt.toISOString(),
          currentPhase: attempt.currentPhase,
          phaseStartedAt: attempt.phaseStartedAt?.toISOString(),
          preliminaryDurationMinutes: attempt.preliminaryDurationMinutes,
          writtenDurationMinutes: attempt.writtenDurationMinutes,
          preliminaryEndsAt: attempt.preliminaryEndsAt?.toISOString(),
          writtenEndsAt: attempt.writtenEndsAt?.toISOString(),
          shuffledOrder: attempt.shuffledOrder,
          answers: attempt.answers.map((answer) => ({
            questionId: answer.questionId.toString(),
            selectedOptionIndex: answer.selectedOptionIndex,
            answeredAt: answer.answeredAt?.toISOString() ?? null,
            pdfUrl: answer.pdfUrl ?? null,
            pdfPublicId: answer.pdfPublicId ?? null,
            uploadedAt: answer.uploadedAt?.toISOString() ?? null,
          })),
        }}
        questions={orderedQuestions.map((question, position) => ({
          id: question.id,
          position,
          source: question.source,
          questionText: question.questionText,
          options: question.options,
          marks: question.marks,
          maxMarks: question.maxMarks,
          subject: question.subject,
        }))}
      />
    );
  }

  if (access.locked) {
    return <FreeTestLockedCard />;
  }

  return (
    <ExamRunner
      key={freeTest._id.toString()}
      exam={{
        id: freeTest._id.toString(),
        kind: "free",
        title: freeTest.title,
        durationMinutes: effectiveDurationMinutes,
        preliminaryDurationMinutes:
          freeTest.preliminaryDurationMinutes ?? freeTest.durationMinutes,
        writtenDurationMinutes: freeTest.writtenDurationMinutes ?? 0,
        writtenQuestionsPerAttempt: freeTest.writtenQuestionsPerAttempt ?? 0,
        totalQuestions: freeTest.totalQuestions,
        preliminaryQuestionCount,
        writtenQuestionCount,
        totalMarks: freeTest.totalMarks,
        questionsPerAttempt: freeTest.questionsPerAttempt,
        passMarkPercent: freeTest.passMarkPercent,
        hasWrittenQuestions:
          freeTest.questions?.some(
            (reference) => reference.sourceCollection === "written_questions"
          ) ?? false,
      }}
      attempt={null}
      questions={null}
    />
  );
}

function ActiveExamBlockedCard({ active }: { active: ActiveExam }) {
  const resumeHref =
    active && active.kind === "free"
      ? `/dashboard/free-tests/${active.examId}`
      : active && active.kind === "written"
        ? `/dashboard/mock-exams/written/${active.examId}`
        : active
          ? `/dashboard/mock-exams/${active.examId}`
          : "/dashboard";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center text-amber-600">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-primary">
          You have an active exam in progress.
        </h1>
        <p className="mt-3 text-sm text-muted">
          Finish your current exam before starting another one.
        </p>
        <Link
          href={resumeHref}
          className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm text-cream hover:bg-primary-dark"
        >
          Resume exam
        </Link>
      </div>
    </div>
  );
}
