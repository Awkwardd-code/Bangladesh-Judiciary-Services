import { ObjectId } from "mongodb";
import { z } from "zod";

import { requireSession } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { preliminaryAttemptsCol, preliminaryExamsCol, preliminaryQuestionsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

const submitSchema = z.object({
  attemptId: z.string().min(1),
  reason: z.enum(["manual", "tab-change", "visibility-hidden", "time-expired"]),
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
    const parsed = submitSchema.safeParse(await request.json());

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { attemptId, reason } = parsed.data;
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

    const exam = await (await preliminaryExamsCol()).findOne({ _id: examId });
    const questions = await (await preliminaryQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      const answer = attempt.answers.find(
        (item) => item.questionId.toString() === question._id.toString(),
      );

      if (!answer || answer.selectedOptionIndex === null) {
        skippedCount += 1;
        continue;
      }

      if (answer.selectedOptionIndex === question.correctOptionIndex) {
        score += question.marks;
        correctCount += 1;
      } else {
        score = Math.max(0, score - (exam?.negativeMarking ?? 0));
        wrongCount += 1;
      }
    }

    const submittedAt = new Date();
    const status = reason === "time-expired" ? "auto-submitted" : "submitted";

    await (await preliminaryAttemptsCol()).updateOne(
      { _id: attempt._id },
      {
        $set: {
          score,
          correctCount,
          wrongCount,
          skippedCount,
          submittedAt,
          autoSubmitReason: reason,
          status,
          activeLock: false,
          updatedAt: submittedAt,
        },
      },
    );

    return ok({
      attempt: {
        ...attempt,
        score,
        correctCount,
        wrongCount,
        skippedCount,
        submittedAt,
        autoSubmitReason: reason,
        status,
        activeLock: false,
        updatedAt: submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting preliminary exam:", error);
    return fail("Server error", 500);
  }
}
