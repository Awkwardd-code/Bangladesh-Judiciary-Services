import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ExamResultView } from "@/components/dashboard/exam-result-view";
import { requireSession } from "@/lib/auth-guard";
import { examAttemptsCol, examQuestionsCol, examsCol } from "@/lib/collections";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exam = ObjectId.isValid(id)
    ? await (await examsCol()).findOne({ _id: new ObjectId(id) })
    : null;

  return {
    title: `Result — ${exam?.title ?? "Exam"} — LegalPath Bangladesh`,
  };
}

export default async function UnifiedExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!ObjectId.isValid(id)) {
    redirect("/dashboard/exams");
  }

  if (query.attemptId && !ObjectId.isValid(query.attemptId)) {
    redirect("/dashboard/exams");
  }

  const attempt = await (
    await examAttemptsCol()
  ).findOne(
    {
      examId: new ObjectId(id),
      userId: new ObjectId(session.userId),
      ...(query.attemptId ? { _id: new ObjectId(query.attemptId) } : {}),
      status: { $in: ["submitted", "auto-submitted", "expired", "graded"] },
    },
    {
      sort: { submittedAt: -1 },
    }
  );

  if (!attempt) {
    redirect("/dashboard/exams");
  }

  const exam = await (await examsCol()).findOne({ _id: attempt.examId });
  if (!exam) {
    redirect("/dashboard/exams");
  }

  const questions = await (
    await examQuestionsCol()
  )
    .find({
      examId: exam._id,
      _id: { $in: attempt.answers.map((answer) => answer.questionId) },
    })
    .toArray();
  const attemptTotalMarks = questions.reduce(
    (total, question) =>
      total +
      (exam.kind === "written"
        ? (question.maxMarks ?? question.marks)
        : question.marks),
    0
  );

  const questionMap = new Map(
    questions.map((question) => [question._id.toString(), question])
  );

  const resultQuestions = attempt.answers.flatMap(
    (answer: (typeof attempt.answers)[number], position: number) => {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) {
        return [];
      }

      const perQuestionScores = attempt.perQuestionScores ?? [];
      const score = perQuestionScores.find((item) =>
        item.questionId.equals(question._id),
      );

      return [
        {
          questionId: question._id.toString(),
          questionText: question.questionText,
          options: question.options ?? [],
          correctOptionIndex: question.correctOptionIndex,
          selectedOptionIndex: answer.selectedOptionIndex ?? null,
          isCorrect:
            answer.selectedOptionIndex !== null &&
            answer.selectedOptionIndex !== undefined &&
            answer.selectedOptionIndex === question.correctOptionIndex,
          skipped:
            answer.selectedOptionIndex === null ||
            answer.selectedOptionIndex === undefined,
          marks: question.marks,
          maxMarks: question.maxMarks,
          subject: question.subject ?? "General",
          explanation: question.explanation,
          pdfUrl: answer.pdfUrl ?? null,
          awardedMarks: score?.awardedMarks,
          comment: score?.comment,
          position,
        },
      ];
    },
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
        passMarkPercent: attempt.passMarkPercent,
        status: attempt.status,
      }}
      exam={{
        id: exam._id.toString(),
        title: exam.title,
        totalMarks: attemptTotalMarks,
        durationMinutes: exam.durationMinutes,
      }}
      questions={resultQuestions}
      kind={exam.kind}
    />
  );
}
