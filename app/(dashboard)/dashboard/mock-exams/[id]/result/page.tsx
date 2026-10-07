import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ExamResultView } from "@/components/dashboard/exam-result-view";
import { requireSession } from "@/lib/auth-guard";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
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
  const exam = await (await preliminaryExamsCol()).findOne({
    _id: new ObjectId(id),
  });
  return { title: `Result — ${exam?.title ?? "Exam"} — BJS Prep` };
}

export default async function PreliminaryResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (query.attemptId && !ObjectId.isValid(query.attemptId)) {
    redirect("/dashboard/results");
  }
  if (!query.attemptId && !ObjectId.isValid(id)) {
    redirect("/dashboard/results");
  }
  await ensureIndexes();

  const attempt = await (await preliminaryAttemptsCol()).findOne(
    {
      ...(query.attemptId ? { _id: new ObjectId(query.attemptId) } : {}),
      ...(!query.attemptId ? { examId: new ObjectId(id) } : {}),
      userId: new ObjectId(session.userId),
      status: { $in: ["submitted", "auto-submitted", "expired"] },
    },
    { sort: { submittedAt: -1 } },
  );
  if (!attempt) redirect("/dashboard/results");

  const exam = await (await preliminaryExamsCol()).findOne({
    _id: attempt.examId,
  });
  if (!exam) redirect("/dashboard/results");

  const questions = await (await preliminaryQuestionsCol())
    .find({
      _id: { $in: attempt.answers.map((answer) => answer.questionId) },
      examId: attempt.examId,
    })
    .toArray();
  const questionMap = new Map(
    questions.map((question) => [question._id.toString(), question]),
  );
  const attemptTotalMarks = questions.reduce(
    (total, question) => total + question.marks,
    0,
  );
  const resultQuestions = attempt.answers.flatMap((answer, position) => {
    const question = questionMap.get(answer.questionId.toString());
    if (!question) return [];
    return [
      {
        position,
        questionId: question._id.toString(),
        questionText: question.questionText,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect:
          answer.selectedOptionIndex !== null &&
          answer.selectedOptionIndex === question.correctOptionIndex,
        skipped: answer.selectedOptionIndex === null,
        marks: question.marks,
        subject: question.subject ?? "General",
        explanation: question.explanation,
      },
    ];
  });

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
        status: attempt.status,
      }}
      exam={{
        id: exam._id.toString(),
        title: exam.title,
        totalMarks: attemptTotalMarks,
        durationMinutes: exam.durationMinutes,
      }}
      questions={resultQuestions}
      kind="preliminary"
    />
  );
}
