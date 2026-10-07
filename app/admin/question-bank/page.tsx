import { QuestionBankClient } from "@/components/admin/question-bank-client";
import { preliminaryQuestionsCol, writtenQuestionsCol } from "@/lib/collections";
import { requireAdmin } from "@/lib/auth-guard";

export default async function QuestionBankPage() {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const [preliminary, written] = await Promise.all([
    (await preliminaryQuestionsCol())
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    (await writtenQuestionsCol())
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);

  const merged = [
    ...preliminary.map((question) => ({
      _id: question._id.toString(),
      kind: "preliminary" as const,
      examId: question.examId.toString(),
      questionText: question.questionText,
      subject: question.subject ?? "General",
      marks: question.marks,
      order: question.order,
      createdAt: question.createdAt,
    })),
    ...written.map((question) => ({
      _id: question._id.toString(),
      kind: "written" as const,
      examId: question.examId.toString(),
      questionText: question.questionText,
      subject: question.subject ?? "General",
      marks: question.maxMarks,
      order: question.order,
      createdAt: question.createdAt,
    })),
  ].sort((a, b) => {
    const valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return valueB - valueA;
  });

  return <QuestionBankClient initialQuestions={merged} />;
}
