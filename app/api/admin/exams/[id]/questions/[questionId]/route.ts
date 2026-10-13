import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { examQuestionsCol, examsCol } from "@/lib/collections";
import { examQuestionUpdateSchema } from "@/lib/validators/exam";

async function refreshExamTotals(examId: ObjectId) {
  const examCollection = await examsCol();
  const exam = await examCollection.findOne({ _id: examId });
  if (!exam) {
    return;
  }

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
                exam.kind === "written"
                  ? { $ifNull: ["$maxMarks", "$marks"] }
                  : "$marks",
            },
          },
        },
      ])
      .toArray(),
  ]);

  await examCollection.updateOne(
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id, questionId } = await params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(questionId)) {
      return fail("Question not found.", 404);
    }

    const parsed = examQuestionUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid question payload.",
        400,
      );
    }

    const examId = new ObjectId(id);
    const questionObjectId = new ObjectId(questionId);
    const collection = await examQuestionsCol();
    const existing = await collection.findOne({
      _id: questionObjectId,
      examId,
    });
    if (!existing) {
      return fail("Question not found.", 404);
    }

    if (
      parsed.data.order !== undefined &&
      parsed.data.order !== existing.order &&
      (await collection.findOne({
        examId,
        order: parsed.data.order,
        _id: { $ne: questionObjectId },
      }))
    ) {
      return fail("A question already uses this order.", 409);
    }

    const patch: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date(),
    };
    if (parsed.data.maxMarks !== undefined && parsed.data.options === undefined) {
      patch.marks = parsed.data.maxMarks;
    }

    await collection.updateOne(
      { _id: questionObjectId, examId },
      { $set: patch },
    );
    await refreshExamTotals(examId);

    const updated = await collection.findOne({
      _id: questionObjectId,
      examId,
    });
    return ok({ question: updated });
  } catch (error) {
    console.error("Update admin exam question error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id, questionId } = await params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(questionId)) {
      return fail("Question not found.", 404);
    }

    const examId = new ObjectId(id);
    const deleted = await (await examQuestionsCol()).deleteOne({
      _id: new ObjectId(questionId),
      examId,
    });
    if (deleted.deletedCount === 0) {
      return fail("Question not found.", 404);
    }

    await refreshExamTotals(examId);
    return ok({ message: "Question deleted." });
  } catch (error) {
    console.error("Delete admin exam question error", error);
    return fail("Server error", 500);
  }
}
