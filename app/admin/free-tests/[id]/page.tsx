import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";

import { FreeTestEditor } from "@/components/admin/free-test-editor";
import { requireAdmin } from "@/lib/auth-guard";
import { freeTestsCol, preliminaryQuestionsCol, writtenQuestionsCol } from "@/lib/collections";
import { serializeFreeTest, type ResolvedQuestion } from "@/lib/free-test-serializer";

async function resolveFreeTestQuestions(freeTest: any): Promise<ResolvedQuestion[]> {
  const refs = Array.isArray(freeTest?.questions) ? freeTest.questions : [];

  if (refs.length === 0) {
    return [];
  }

  const ids = {
    preliminary_questions: refs
      .filter((ref: any) => String(ref?.sourceCollection ?? "") === "preliminary_questions")
      .map((ref: any) => new ObjectId(String(ref.questionId))),
    written_questions: refs
      .filter((ref: any) => String(ref?.sourceCollection ?? "") === "written_questions")
      .map((ref: any) => new ObjectId(String(ref.questionId))),
  };

  const [preliminary, written] = await Promise.all([
    ids.preliminary_questions.length > 0
      ? (await preliminaryQuestionsCol())
          .find({ _id: { $in: ids.preliminary_questions } })
          .toArray()
      : [],
    ids.written_questions.length > 0
      ? (await writtenQuestionsCol())
          .find({ _id: { $in: ids.written_questions } })
          .toArray()
      : [],
  ]);

  const bank = new Map<string, any>();

  for (const question of preliminary) {
    bank.set(question._id.toString(), { ...question, sourceCollection: "preliminary_questions" });
  }

  for (const question of written) {
    bank.set(question._id.toString(), { ...question, sourceCollection: "written_questions" });
  }

  return refs
    .map((ref: any) => {
      const question = bank.get(String(ref?.questionId ?? ""));

      if (!question) {
        return null;
      }

      return {
        id: String(question._id),
        sourceCollection: String(
          ref?.sourceCollection ?? question.sourceCollection,
        ) as "preliminary_questions" | "written_questions",
        questionText: String(question.questionText ?? ""),
        options: Array.isArray(question.options)
          ? question.options.map((item: unknown) => String(item))
          : undefined,
        maxMarks:
          typeof question.maxMarks === "number" ? question.maxMarks : undefined,
        marks: Number(ref?.marks ?? question.marks ?? question.maxMarks ?? 0),
        subject: String(question.subject ?? "General"),
      };
    })
    .filter(Boolean) as ResolvedQuestion[];
}

export default async function FreeTestAdminEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const freeTest = await (await freeTestsCol()).findOne({
    _id: new ObjectId(id),
  });

  if (!freeTest) {
    notFound();
  }

  return (
    <FreeTestEditor
      freeTest={serializeFreeTest(freeTest)}
      initialQuestions={await resolveFreeTestQuestions(freeTest)}
    />
  );
}
