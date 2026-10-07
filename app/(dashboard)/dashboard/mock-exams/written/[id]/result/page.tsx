import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ExamResultView } from "@/components/dashboard/exam-result-view";
import { requireSession } from "@/lib/auth-guard";
import {
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
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
  const exam = await (await writtenExamsCol()).findOne({
    _id: new ObjectId(id),
  });
  return { title: `Result — ${exam?.title ?? "Written exam"} — BJS Prep` };
}

export default async function WrittenResultPage({
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

  const submission = await (await writtenSubmissionsCol()).findOne(
    {
      ...(query.attemptId ? { _id: new ObjectId(query.attemptId) } : {}),
      ...(!query.attemptId ? { examId: new ObjectId(id) } : {}),
      userId: new ObjectId(session.userId),
      status: { $in: ["submitted", "under-review", "graded"] },
    },
    { sort: { submittedAt: -1 } },
  );
  if (!submission) redirect("/dashboard/results");

  const exam = await (await writtenExamsCol()).findOne({
    _id: submission.examId,
  });
  if (!exam) redirect("/dashboard/results");

  const answers = submission.perQuestionAnswers ?? [];
  const questions = await (await writtenQuestionsCol())
    .find({
      _id: {
        $in: answers.length
          ? answers.map((answer) => answer.questionId)
          : submission.selectedQuestionIds ?? [],
      },
      examId: submission.examId,
    })
    .toArray();
  const questionMap = new Map(
    questions.map((question) => [question._id.toString(), question]),
  );
  const answersMap = new Map(
    answers.map((answer) => [answer.questionId.toString(), answer]),
  );
  const scoreMap = new Map(
    (submission.perQuestionScores ?? []).map((score) => [
      score.questionId.toString(),
      score,
    ]),
  );
  const orderedIds =
    submission.selectedQuestionIds?.length
      ? submission.selectedQuestionIds
      : answers.map((answer) => answer.questionId);
  const resultQuestions = orderedIds.flatMap((questionId, position) => {
    const question = questionMap.get(questionId.toString());
    if (!question) return [];
    const answer = answersMap.get(questionId.toString());
    const score = scoreMap.get(questionId.toString());
    return [
      {
        position,
        questionId: question._id.toString(),
        questionText: question.questionText,
        marks: question.maxMarks,
        maxMarks: question.maxMarks,
        subject: question.subject ?? "General",
        pdfUrl: answer?.pdfUrl ?? null,
        awardedMarks:
          submission.status === "graded" ? score?.awardedMarks : undefined,
        comment:
          submission.status === "graded" ? score?.comment : undefined,
      },
    ];
  });

  return (
    <ExamResultView
      attempt={{
        id: submission._id.toString(),
        score: submission.totalScore,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        submittedAt: submission.submittedAt?.toISOString() ?? null,
        autoSubmitReason: submission.autoSubmitReason ?? null,
        status: submission.status,
        feedback: submission.feedback ?? null,
        awaitingReview:
          submission.status === "submitted" ||
          submission.status === "under-review",
      }}
      exam={{
        id: exam._id.toString(),
        title: exam.title,
        totalMarks: submission.maxScore || exam.totalMarks,
        durationMinutes: exam.durationMinutes,
      }}
      questions={resultQuestions}
      kind="written"
    />
  );
}
