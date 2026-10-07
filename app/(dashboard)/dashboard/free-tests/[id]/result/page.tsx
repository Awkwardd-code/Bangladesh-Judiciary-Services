import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ExamResultView } from "@/components/dashboard/exam-result-view";
import { requireSession } from "@/lib/auth-guard";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return { title: "Result — BJS Prep" };
  const test = await (await freeTestsCol()).findOne({ _id: new ObjectId(id) });
  return { title: `Result — ${test?.title ?? "Free test"} — BJS Prep` };
}

export default async function FreeTestResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!ObjectId.isValid(id)) redirect("/dashboard/results");
  if (query.attemptId && !ObjectId.isValid(query.attemptId)) {
    redirect("/dashboard/results");
  }
  await ensureIndexes();

  const testId = new ObjectId(id);
  const attempt = await (await freeTestAttemptsCol()).findOne(
    {
      ...(query.attemptId ? { _id: new ObjectId(query.attemptId) } : {}),
      freeTestId: testId,
      userId: new ObjectId(session.userId),
      status: { $in: ["submitted", "expired"] },
    },
    { sort: { submittedAt: -1 } },
  );
  if (!attempt) redirect("/dashboard/results");

  const test = await (await freeTestsCol()).findOne({ _id: testId });
  if (!test) redirect("/dashboard/results");

  const legacyRefs = test.questions ?? [];
  const entries = await Promise.all(
    attempt.answers.map(async (answer, position) => {
      const sourceCollection =
        answer.sourceCollection ??
        legacyRefs.find((item) => item.questionId.equals(answer.questionId))
          ?.sourceCollection ??
        "preliminary_questions";
      const collection =
        sourceCollection === "preliminary_questions"
          ? await preliminaryQuestionsCol()
          : await writtenQuestionsCol();
      const question = await collection.findOne({ _id: answer.questionId });
      const marks =
        answer.marks ??
        legacyRefs.find(
          (item) =>
            item.sourceCollection === sourceCollection &&
            item.questionId.equals(answer.questionId),
        )?.marks ??
        0;
      return { answer, question, position, sourceCollection, marks };
    }),
  );
  const totalMarks = entries.reduce((total, entry) => total + entry.marks, 0);
  const orderedEntries = (attempt.shuffledOrder ?? [])
    .map((position) => entries[position])
    .filter((entry) => entry !== undefined);
  const questions = orderedEntries.map((entry, position) => {
    const detail = entry.question;
    const correctOptionIndex =
      detail && "correctOptionIndex" in detail
        ? detail.correctOptionIndex
        : undefined;
    const selectedOptionIndex = entry.answer.selectedOptionIndex;
    const isMcq =
      entry.sourceCollection === "preliminary_questions" &&
      typeof correctOptionIndex === "number";
    return {
      position,
      questionId: detail?._id.toString() ?? entry.answer.questionId.toString(),
      questionText: detail?.questionText ?? "Question unavailable",
      options: detail && "options" in detail ? detail.options : undefined,
      correctOptionIndex,
      selectedOptionIndex,
      isCorrect:
        isMcq &&
        selectedOptionIndex !== null &&
        selectedOptionIndex === correctOptionIndex,
      skipped: isMcq && selectedOptionIndex === null,
      marks: entry.marks,
      maxMarks: entry.marks,
      subject: detail?.subject ?? "General",
      pdfUrl: entry.answer.pdfUrl ?? null,
      explanation:
        detail && "explanation" in detail ? detail.explanation : undefined,
    };
  });
  const passMarkPercent = attempt.passMarkPercent ?? test.passMarkPercent;
  const passed =
    totalMarks > 0 &&
    (attempt.score / totalMarks) * 100 >= passMarkPercent;
  const pendingWritten = entries.some(
    (entry) => entry.sourceCollection === "written_questions",
  );

  return (
    <ExamResultView
      attempt={{
        id: attempt._id.toString(),
        score: attempt.score,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        autoSubmitReason: attempt.autoSubmitReason ?? null,
        passMarkPercent,
        status: attempt.status,
        awaitingReview: pendingWritten,
      }}
      exam={{
        id: test._id.toString(),
        title: test.title,
        totalMarks,
        durationMinutes:
          (attempt.preliminaryDurationMinutes ??
            test.preliminaryDurationMinutes ??
            test.durationMinutes) +
          (attempt.writtenDurationMinutes ?? test.writtenDurationMinutes ?? 0),
      }}
      questions={questions}
      kind="free"
      passed={passed}
      phaseBreakdown={{
        preliminaryDurationMinutes:
          attempt.preliminaryDurationMinutes ??
          test.preliminaryDurationMinutes ??
          test.durationMinutes,
        writtenDurationMinutes:
          attempt.writtenDurationMinutes ?? test.writtenDurationMinutes ?? 0,
      }}
    />
  );
}
