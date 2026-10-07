import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { freeTestQuestionsSchema } from "@/lib/validators/free-test";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const { id } = await params;
    const body = await req.json();
    const parsed = freeTestQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid questions", 400);
    }

    const freeTest = await (await freeTestsCol()).findOne({
      _id: new ObjectId(id),
    });

    if (!freeTest) {
      return fail("Free test not found", 404);
    }

    const sourceIds = {
      preliminary_questions: parsed.data.questions
        .filter((entry) => entry.sourceCollection === "preliminary_questions")
        .map((entry) => new ObjectId(entry.questionId)),
      written_questions: parsed.data.questions
        .filter((entry) => entry.sourceCollection === "written_questions")
        .map((entry) => new ObjectId(entry.questionId)),
    };

    const [preliminary, written] = await Promise.all([
      sourceIds.preliminary_questions.length > 0
        ? (await preliminaryQuestionsCol())
            .find({ _id: { $in: sourceIds.preliminary_questions } })
            .toArray()
        : [],
      sourceIds.written_questions.length > 0
        ? (await writtenQuestionsCol())
            .find({ _id: { $in: sourceIds.written_questions } })
            .toArray()
        : [],
    ]);

    const bank = new Map<string, any>();

    for (const question of preliminary) {
      bank.set(question._id.toString(), question);
    }

    for (const question of written) {
      bank.set(question._id.toString(), question);
    }

    const refs: Array<{
      sourceCollection: "preliminary_questions" | "written_questions";
      questionId: ObjectId;
      marks: number;
      order: number;
    }> = [];

    for (const [index, entry] of parsed.data.questions.entries()) {
      const question = bank.get(entry.questionId);

      if (!question) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "Skipping missing free test question",
            entry.questionId,
          );
        }
        continue;
      }

      refs.push({
        sourceCollection: entry.sourceCollection,
        questionId: new ObjectId(entry.questionId),
        marks: Number(
          entry.sourceCollection === "preliminary_questions"
            ? question.marks ?? 0
            : question.maxMarks ?? 0,
        ),
        order: index,
      });
    }

    const totalMarks = refs.reduce((sum, question) => sum + question.marks, 0);

    const updated = await (await freeTestsCol()).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          questions: refs,
          totalQuestions: refs.length,
          totalMarks,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    return ok({
      freeTest: updated,
      resolved: refs.length,
    });
  } catch (error) {
    console.error("Update free test questions error", error);
    return fail("Server error", 500);
  }
}
