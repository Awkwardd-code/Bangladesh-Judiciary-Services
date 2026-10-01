import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { preliminaryQuestionCreateSchema } from "@/lib/validators/admin";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const { id } = await params;
    const questions = await (
      await preliminaryQuestionsCol()
    )
      .find({ examId: new ObjectId(id) })
      .sort({ order: 1 })
      .toArray();
    return ok({ questions });
  } catch (error) {
    console.error("List questions error", error);
    return fail("Server error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const parsed = preliminaryQuestionCreateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid question", 400);
    const { id } = await params;
    const examId = new ObjectId(id);
    if (!(await (await preliminaryExamsCol()).findOne({ _id: examId })))
      return fail("Exam not found", 404);
    const questions = await preliminaryQuestionsCol();
    if (await questions.findOne({ examId, order: parsed.data.order }))
      return fail("Question order already exists", 409);
    const now = new Date();
    const question = {
      _id: new ObjectId(),
      ...parsed.data,
      examId,
      createdAt: now,
      updatedAt: now,
    };
    await questions.insertOne(question);
    await refresh(examId);
    return ok({ question }, 201);
  } catch (error) {
    console.error("Create question error", error);
    return fail("Server error", 500);
  }
}
