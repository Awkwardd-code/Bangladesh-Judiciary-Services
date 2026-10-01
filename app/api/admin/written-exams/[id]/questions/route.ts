import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { writtenExamsCol, writtenQuestionsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { writtenQuestionCreateSchema } from "@/lib/validators/admin";

type RouteContext = { params: Promise<{ id: string }> };

const modelAnswerFields = {
  modelAnswerUrl: z.string().url().optional(),
  modelAnswerPublicId: z.string().trim().min(1).optional(),
};
const createSchema = writtenQuestionCreateSchema.extend(modelAnswerFields);

async function refreshExamTotals(examId: ObjectId) {
  const questions = await writtenQuestionsCol();
  const [totalQuestions, rows] = await Promise.all([
    questions.countDocuments({ examId }),
    questions
      .aggregate([
        { $match: { examId } },
        { $group: { _id: null, totalMarks: { $sum: "$maxMarks" } } },
      ])
      .toArray(),
  ]);

  await (
    await writtenExamsCol()
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

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Written exam not found", 404);
    }

    const examId = new ObjectId(id);
    if (!(await (await writtenExamsCol()).findOne({ _id: examId }))) {
      return fail("Written exam not found", 404);
    }

    const questions = await (
      await writtenQuestionsCol()
    )
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    return ok({ questions });
  } catch (error) {
    console.error("List written questions error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid question", 400);
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Written exam not found", 404);
    }

    const examId = new ObjectId(id);
    if (!(await (await writtenExamsCol()).findOne({ _id: examId }))) {
      return fail("Written exam not found", 404);
    }

    const questions = await writtenQuestionsCol();
    if (await questions.findOne({ examId, order: parsed.data.order })) {
      return fail("Question order already exists", 409);
    }

    const now = new Date();
    const question = {
      _id: new ObjectId(),
      ...parsed.data,
      examId,
      subject: parsed.data.subject ?? "",
      createdAt: now,
      updatedAt: now,
    };
    await questions.insertOne(question);
    await refreshExamTotals(examId);

    return ok({ question }, 201);
  } catch (error) {
    console.error("Create written question error", error);
    return fail("Server error", 500);
  }
}
