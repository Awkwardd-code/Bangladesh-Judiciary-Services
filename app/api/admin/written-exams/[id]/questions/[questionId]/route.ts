import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteFile } from "@/lib/cloudinary";
import { writtenExamsCol, writtenQuestionsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { writtenQuestionCreateSchema } from "@/lib/validators/admin";

type RouteContext = {
  params: Promise<{ id: string; questionId: string }>;
};

const updateSchema = writtenQuestionCreateSchema.partial().extend({
  modelAnswerUrl: z.string().url().or(z.literal("")).optional(),
  modelAnswerPublicId: z.string().trim().optional(),
});

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

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid question", 400);
    }

    await ensureIndexes();
    const { id, questionId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(questionId)) {
      return fail("Question not found", 404);
    }

    const examId = new ObjectId(id);
    const questionObjectId = new ObjectId(questionId);
    const questions = await writtenQuestionsCol();
    const existing = await questions.findOne({
      _id: questionObjectId,
      examId,
    });

    if (!existing) {
      return fail("Question not found", 404);
    }

    if (
      parsed.data.order !== undefined &&
      parsed.data.order !== existing.order &&
      (await questions.findOne({ examId, order: parsed.data.order }))
    ) {
      return fail("Question order already exists", 409);
    }

    await questions.updateOne(
      { _id: questionObjectId, examId },
      {
        $set: {
          ...parsed.data,
          subject: parsed.data.subject ?? existing.subject ?? "",
          updatedAt: new Date(),
        },
      },
    );

    if (
      existing.modelAnswerPublicId &&
      parsed.data.modelAnswerPublicId !== undefined &&
      existing.modelAnswerPublicId !== parsed.data.modelAnswerPublicId
    ) {
      try {
        await deleteFile(existing.modelAnswerPublicId, "raw");
      } catch (error) {
        console.error("Delete old model answer error", error);
      }
    }

    await refreshExamTotals(examId);

    return ok({ question: await questions.findOne({ _id: questionObjectId }) });
  } catch (error) {
    console.error("Update written question error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const { id, questionId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(questionId)) {
      return fail("Question not found", 404);
    }

    const examId = new ObjectId(id);
    const questionObjectId = new ObjectId(questionId);
    const questions = await writtenQuestionsCol();
    const existing = await questions.findOne({
      _id: questionObjectId,
      examId,
    });

    if (!existing) {
      return fail("Question not found", 404);
    }

    if (existing.modelAnswerPublicId) {
      try {
        await deleteFile(existing.modelAnswerPublicId, "raw");
      } catch (error) {
        console.error("Delete model answer error", error);
      }
    }

    await questions.deleteOne({ _id: questionObjectId, examId });
    await refreshExamTotals(examId);

    return ok({ message: "Written question deleted." });
  } catch (error) {
    console.error("Delete written question error", error);
    return fail("Server error", 500);
  }
}
