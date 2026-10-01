import { ObjectId } from "mongodb";
import { z } from "zod";

import { requireSession } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { preliminaryAttemptsCol } from "@/lib/collections";
import { releaseExamLock } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";

const answerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();

    if (!session) {
      return fail("Not authenticated", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { attemptId, questionId, selectedOptionIndex } = parsed.data;
    const examId = new ObjectId(id);
    const userId = new ObjectId(session.userId);

    await ensureIndexes();

    const attempt = await (await preliminaryAttemptsCol()).findOne({
      _id: new ObjectId(attemptId),
      userId,
      examId,
      activeLock: true,
    });

    if (!attempt) {
      return fail("Attempt not found", 404);
    }

    if (attempt.status !== "in-progress") {
      return fail("Exam is no longer active", 409);
    }

    if (Date.now() > new Date(attempt.expiresAt).getTime()) {
      await releaseExamLock("preliminary", attempt._id);
      return fail("Exam expired", 410);
    }

    const answerEntry = attempt.answers.find(
      (answer) => answer.questionId.toString() === questionId,
    );

    if (!answerEntry) {
      return fail("Question not found", 404);
    }

    if (answerEntry.selectedOptionIndex !== null) {
      return fail("Answer already locked.", 403);
    }

    const now = new Date();

    await (await preliminaryAttemptsCol()).updateOne(
      {
        _id: attempt._id,
        "answers.questionId": new ObjectId(questionId),
      },
      {
        $set: {
          "answers.$.selectedOptionIndex": selectedOptionIndex,
          "answers.$.answeredAt": now,
          updatedAt: now,
        },
      },
    );

    return ok({ locked: true });
  } catch (error) {
    console.error("Error answering preliminary question:", error);
    return fail("Server error", 500);
  }
}
