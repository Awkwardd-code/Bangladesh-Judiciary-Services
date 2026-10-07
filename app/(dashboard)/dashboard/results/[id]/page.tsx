import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";

import { ExamResultClient } from "@/components/dashboard/exam-result-client";
import { WrittenSubmissionResult } from "@/components/dashboard/written-submission-result";
import { requireSession } from "@/lib/auth-guard";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
  freeTestAttemptsCol,
  writtenExamsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";

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
  if (!ObjectId.isValid(id)) return notFound();
  const userId = new ObjectId(session.userId);
  const attemptId = new ObjectId(id);
  const freeTestAttempt = await (await freeTestAttemptsCol()).findOne({
    _id: attemptId,
    userId,
  });

  if (freeTestAttempt) {
    redirect(
      `/dashboard/free-tests/${freeTestAttempt.freeTestId}/result?attemptId=${attemptId}`,
    );
  }

  const submission = await (await writtenSubmissionsCol()).findOne({
    _id: attemptId,
    userId,
  });

  if (submission) {
    const exam = await (await writtenExamsCol()).findOne({
      _id: submission.examId,
    });

    if (!exam) return notFound();

    return (
      <WrittenSubmissionResult
        title={exam.title}
        status={submission.status}
        score={submission.totalScore}
        maxScore={submission.maxScore || exam.totalMarks}
        submittedAt={submission.submittedAt ?? null}
        answersPdfUrl={submission.answersPdfUrl}
        feedback={submission.feedback}
      />
    );
  }

  const attempt = await (await preliminaryAttemptsCol()).findOne({
    _id: attemptId,
    userId,
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
    .find({
      _id: { $in: attempt.answers.map((answer) => answer.questionId) },
      examId: attempt.examId,
    })
    .toArray();
  const questionById = new Map(
    questions.map((question) => [question._id.toString(), question]),
  );
  const resultQuestions = attempt.answers.flatMap((answer) => {
    const question = questionById.get(answer.questionId.toString());
    if (!question) return [];

    return [
      {
        id: question._id.toString(),
        questionText: question.questionText,
        studentAnswer: answer.selectedOptionIndex,
        correctAnswer: question.correctOptionIndex,
        options: question.options,
        explanation: question.explanation,
        marks: question.marks,
      },
    ];
  });

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
    questions: resultQuestions,
  };

  return <ExamResultClient result={result} />;
}
