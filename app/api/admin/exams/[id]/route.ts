import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  coursesCol,
  examAttemptsCol,
  examQuestionsCol,
  examsCol,
} from "@/lib/collections";
import type { Exam, ExamQuestion } from "@/lib/types/exam";
import { examUpdateSchema } from "@/lib/validators/exam";

function serializeExam(exam: Exam) {
  return {
    ...exam,
    _id: exam._id.toString(),
    courseId: exam.courseId.toString(),
    segmentId: exam.segmentId.toString(),
    subSegmentId: exam.subSegmentId.toString(),
    createdBy: exam.createdBy.toString(),
    scheduledAt: exam.scheduledAt?.toISOString() ?? null,
    closesAt: exam.closesAt?.toISOString() ?? null,
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
  };
}

function serializeQuestion(question: ExamQuestion) {
  return {
    ...question,
    _id: question._id.toString(),
    examId: question.examId.toString(),
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}

async function calculateTotals(examId: ObjectId, kind: Exam["kind"]) {
  const questions = await examQuestionsCol();
  const [totalQuestions, rows] = await Promise.all([
    questions.countDocuments({ examId }),
    questions
      .aggregate<{ totalMarks: number }>([
        { $match: { examId } },
        {
          $group: {
            _id: null,
            totalMarks: {
              $sum:
                kind === "written"
                  ? { $ifNull: ["$maxMarks", "$marks"] }
                  : "$marks",
            },
          },
        },
      ])
      .toArray(),
  ]);

  return { totalQuestions, totalMarks: Number(rows[0]?.totalMarks ?? 0) };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const examId = new ObjectId(id);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const questions = await (await examQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    return ok({
      exam: serializeExam(exam),
      questions: questions.map(serializeQuestion),
    });
  } catch (error) {
    console.error("Get admin exam error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const parsed = examUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid exam payload.", 400);
    }

    const examId = new ObjectId(id);
    const collection = await examsCol();
    const existing = await collection.findOne({ _id: examId });
    if (!existing) {
      return fail("Exam not found.", 404);
    }

    const data = parsed.data;
    const courseId = data.courseId ? new ObjectId(data.courseId) : existing.courseId;
    const segmentId = data.segmentId
      ? new ObjectId(data.segmentId)
      : existing.segmentId;
    const subSegmentId = data.subSegmentId
      ? new ObjectId(data.subSegmentId)
      : existing.subSegmentId;
    const kind = data.kind ?? existing.kind;
    const status = data.status ?? existing.status;
    const course = await (await coursesCol()).findOne({ _id: courseId });
    const segment = course?.segments?.find(
      (item) => item._id.toString() === segmentId.toString(),
    );
    const subSegment = segment?.subSegments.find(
      (item) => item._id.toString() === subSegmentId.toString(),
    );

    if (!course || !segment || !subSegment) {
      return fail("The selected course content no longer exists.", 400);
    }

    const totals =
      status === "published" ? await calculateTotals(examId, kind) : null;
    if (totals && totals.totalQuestions === 0) {
      return fail("Add at least one question before publishing.", 400);
    }

    const now = new Date();
    const update: Record<string, unknown> = {
      ...data,
      courseId,
      segmentId,
      subSegmentId,
      kind,
      status,
      type: data.type ?? existing.type,
      price: data.price ?? existing.price,
      validityMonths: data.validityMonths ?? existing.validityMonths,
      purchaseMode: data.purchaseMode ?? existing.purchaseMode,
      segments: data.segments ?? existing.segments,
      thumbnailUrl: data.thumbnailUrl ?? existing.thumbnailUrl,
      thumbnailPublicId: data.thumbnailPublicId ?? existing.thumbnailPublicId,
      discountedPrice:
        data.discountedPrice !== undefined
          ? data.discountedPrice
          : existing.discountedPrice,
      discountTill:
        data.discountTill !== undefined
          ? new Date(data.discountTill)
          : existing.discountTill,
      scheduledAt:
        data.scheduledAt !== undefined
          ? new Date(data.scheduledAt)
          : existing.scheduledAt,
      closesAt:
        data.closesAt !== undefined
          ? new Date(data.closesAt)
          : existing.closesAt,
      updatedAt: now,
    };

    if (totals) {
      update.totalQuestions = totals.totalQuestions;
      update.totalMarks = totals.totalMarks;
    }

    await collection.updateOne({ _id: examId }, { $set: update });
    const refreshed = await collection.findOne({ _id: examId });
    if (!refreshed) {
      return fail("Exam could not be loaded after update.", 500);
    }

    return ok({ exam: serializeExam(refreshed) });
  } catch (error) {
    console.error("Update admin exam error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const examId = new ObjectId(id);
    const deleted = await (await examsCol()).deleteOne({ _id: examId });
    if (deleted.deletedCount === 0) {
      return fail("Exam not found.", 404);
    }

    await Promise.all([
      (await examQuestionsCol()).deleteMany({ examId }),
      (await examAttemptsCol()).deleteMany({ examId }),
    ]);

    return ok({ message: "Exam deleted." });
  } catch (error) {
    console.error("Delete admin exam error", error);
    return fail("Server error", 500);
  }
}
