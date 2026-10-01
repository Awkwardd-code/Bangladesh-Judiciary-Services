import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteFile } from "@/lib/cloudinary";
import {
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { writtenExamCreateSchema } from "@/lib/validators/admin";
import { getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = writtenExamCreateSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

async function getTotals(examId: ObjectId) {
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

  return {
    totalQuestions,
    totalMarks: Number(rows[0]?.totalMarks ?? 0),
  };
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

    const exam = await (
      await writtenExamsCol()
    ).findOne({
      _id: new ObjectId(id),
    });

    if (!exam) {
      return fail("Written exam not found", 404);
    }

    return ok({ exam });
  } catch (error) {
    console.error("Get written exam error", error);
    return fail("Server error", 500);
  }
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
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid written exam",
        400,
      );
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Written exam not found", 404);
    }

    const examId = new ObjectId(id);
    const exams = await writtenExamsCol();
    const existing = await exams.findOne({ _id: examId });

    if (!existing) {
      return fail("Written exam not found", 404);
    }

    const totals = await getTotals(examId);

    if (parsed.data.status === "published" && totals.totalQuestions === 0) {
      return fail("Cannot publish an exam with no questions", 400);
    }

    const updateSet = {
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : existing.scheduledAt,
      closesAt: parsed.data.closesAt
        ? new Date(parsed.data.closesAt)
        : existing.closesAt,
      ...totals,
      updatedAt: new Date(),
    };

    await exams.updateOne({ _id: examId }, { $set: updateSet });

    await logAdminAction(
      new ObjectId(session.userId),
      "written-exam.update",
      { examId: examId.toString(), previousStatus: existing.status },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ exam: await exams.findOne({ _id: examId }) });
  } catch (error) {
    console.error("Update written exam error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
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
    const exams = await writtenExamsCol();
    const exam = await exams.findOne({ _id: examId });

    if (!exam) {
      return fail("Written exam not found", 404);
    }

    const [questions, submissions] = await Promise.all([
      (await writtenQuestionsCol()).find({ examId }).toArray(),
      (await writtenSubmissionsCol()).find({ examId }).toArray(),
    ]);
    const publicIds = [
      ...questions.map((question) => question.modelAnswerPublicId),
      ...submissions.map((submission) => submission.answersPdfPublicId),
    ].filter((publicId): publicId is string => Boolean(publicId));

    await Promise.allSettled(
      publicIds.map((publicId) => deleteFile(publicId, "raw")),
    );
    await Promise.all([
      (await writtenQuestionsCol()).deleteMany({ examId }),
      (await writtenSubmissionsCol()).deleteMany({ examId }),
      exams.deleteOne({ _id: examId }),
    ]);

    await logAdminAction(
      new ObjectId(session.userId),
      "written-exam.delete",
      { examId: examId.toString() },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ message: "Written exam deleted." });
  } catch (error) {
    console.error("Delete written exam error", error);
    return fail("Server error", 500);
  }
}
