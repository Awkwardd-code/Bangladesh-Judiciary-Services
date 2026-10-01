import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import { ExamResultClient } from "@/components/dashboard/exam-result-client";
import { requireSession } from "@/lib/auth-guard";
import { preliminaryAttemptsCol, preliminaryExamsCol, preliminaryQuestionsCol } from "@/lib/collections";

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    return notFound();
  }

  const { id } = await params;
  const attempt = await (await preliminaryAttemptsCol()).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(session.userId),
  });

  if (!attempt) {
    return notFound();
  }

  const exam = await (await preliminaryExamsCol()).findOne({
    _id: attempt.examId,
  });

  if (!exam) {
    return notFound();
  }

  const questions = await (await preliminaryQuestionsCol())
    .find({ examId: attempt.examId })
    .sort({ order: 1 })
    .toArray();

  const result = {
    examTitle: exam.title,
    score: Math.max(0, Math.round((attempt.score / Math.max(exam.totalMarks, 1)) * 100)),
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    skippedCount: attempt.skippedCount,
    timeTaken: attempt.submittedAt
      ? `${Math.max(
          1,
          Math.round(
            (new Date(attempt.submittedAt).getTime() -
              new Date(attempt.startedAt).getTime()) /
              60000,
          ),
        )} min`
      : "0 min",
    autoSubmitReason: attempt.autoSubmitReason ?? null,
    questions: questions.map((question) => {
      const answer = attempt.answers.find(
        (item) => item.questionId.toString() === question._id.toString(),
      );

      return {
        id: question._id.toString(),
        questionText: question.questionText,
        studentAnswer: answer?.selectedOptionIndex ?? null,
        correctAnswer: question.correctOptionIndex,
        options: question.options,
        explanation: question.explanation,
        marks: question.marks,
      };
    }),
  };

  return <ExamResultClient result={result} />;
}
