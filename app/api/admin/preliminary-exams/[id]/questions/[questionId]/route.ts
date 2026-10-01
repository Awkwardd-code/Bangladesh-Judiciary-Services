import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { preliminaryQuestionCreateSchema } from "@/lib/validators/admin";

const updateSchema = preliminaryQuestionCreateSchema.partial();

async function refresh(examId: ObjectId) {
  const questions = await preliminaryQuestionsCol();
  const [totalQuestions, rows] = await Promise.all([
    questions.countDocuments({ examId }),
    questions
      .aggregate([
        { $match: { examId } },
        { $group: { _id: null, totalMarks: { $sum: "$marks" } } },
      ])
      .toArray(),
  ]);
  await (
    await preliminaryExamsCol()
  ).updateOne(
    { _id: examId },
    {
      $set: {
        totalQuestions,
        totalMarks: Number(rows[0]?.totalMarks ?? 0),
        updatedAt: new Date(),
      },
    },
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid question", 400);
    const { id, questionId } = await params;
    const examId = new ObjectId(id);
    const questionIdObject = new ObjectId(questionId);
    const questions = await preliminaryQuestionsCol();
    const question = await questions.findOne({ _id: questionIdObject, examId });
    if (!question) return fail("Question not found", 404);
    await questions.updateOne(
      { _id: questionIdObject },
      { $set: { ...parsed.data, updatedAt: new Date() } },
    );
    await refresh(examId);
    return ok({ question: await questions.findOne({ _id: questionIdObject }) });
  } catch (error) {
    console.error("Update question error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    const { id, questionId } = await params;
    const examId = new ObjectId(id);
    const result = await (
      await preliminaryQuestionsCol()
    ).deleteOne({ _id: new ObjectId(questionId), examId });
    if (!result.deletedCount) return fail("Question not found", 404);
    await refresh(examId);
    return ok({ message: "Question deleted." });
  } catch (error) {
    console.error("Delete question error", error);
    return fail("Server error", 500);
  }
}
