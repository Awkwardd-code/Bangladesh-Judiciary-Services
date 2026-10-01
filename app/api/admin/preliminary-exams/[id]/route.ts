import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { preliminaryExamCreateSchema } from "@/lib/validators/admin";
import { getClientIp } from "@/lib/rate-limit";

const updateSchema = preliminaryExamCreateSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

async function totals(examId: ObjectId) {
  const questions = await preliminaryQuestionsCol();
  const [totalQuestions, result] = await Promise.all([
    questions.countDocuments({ examId }),
    questions
      .aggregate([
        { $match: { examId } },
        { $group: { _id: null, totalMarks: { $sum: "$marks" } } },
      ])
      .toArray(),
  ]);
  return { totalQuestions, totalMarks: Number(result[0]?.totalMarks ?? 0) };
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
    const examId = new ObjectId(id);
    const exam = await (await preliminaryExamsCol()).findOne({ _id: examId });
    if (!exam) return fail("Exam not found", 404);
    const questions = await (
      await preliminaryQuestionsCol()
    )
      .find({ examId })
      .sort({ order: 1 })
      .toArray();
    return ok({ exam, questions });
  } catch (error) {
    console.error("Get preliminary exam error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message ?? "Invalid exam", 400);
    const { id } = await params;
    const examId = new ObjectId(id);
    const collection = await preliminaryExamsCol();
    const existing = await collection.findOne({ _id: examId });
    if (!existing) return fail("Exam not found", 404);
    const examTotals = await totals(examId);
    if (parsed.data.status === "published" && examTotals.totalQuestions === 0) {
      return fail("Cannot publish an exam with no questions", 400);
    }
    const updateSet = {
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : undefined,
      closesAt: parsed.data.closesAt
        ? new Date(parsed.data.closesAt)
        : undefined,
      ...examTotals,
      updatedAt: new Date(),
    };
    await collection.updateOne({ _id: examId }, { $set: updateSet });
    await logAdminAction(
      new ObjectId(session.userId),
      "preliminary-exam.update",
      { examId: examId.toString(), previousStatus: existing.status },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );
    return ok({ exam: await collection.findOne({ _id: examId }) });
  } catch (error) {
    console.error("Update preliminary exam error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);
  try {
    await ensureIndexes();
    const { id } = await params;
    const examId = new ObjectId(id);
    const result = await (
      await preliminaryExamsCol()
    ).deleteOne({ _id: examId });
    if (!result.deletedCount) return fail("Exam not found", 404);
    await Promise.all([
      (await preliminaryQuestionsCol()).deleteMany({ examId }),
      (await preliminaryAttemptsCol()).deleteMany({ examId }),
    ]);
    await logAdminAction(
      new ObjectId(session.userId),
      "preliminary-exam.delete",
      { examId: examId.toString() },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );
    return ok({ message: "Exam deleted." });
  } catch (error) {
    console.error("Delete preliminary exam error", error);
    return fail("Server error", 500);
  }
}
