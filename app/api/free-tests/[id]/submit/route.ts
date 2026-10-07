import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import type { FreeTestAttempt } from "@/lib/types/free-test";

const submitSchema = z.object({
  attemptId: z.string().regex(/^[a-f\d]{24}$/i),
  reason: z.enum(["manual", "tab-change", "visibility-hidden", "time-expired"]),
});

export const POST = withGuard(
  { kind: "session" },
  async (request, { params, session }) => {
    try {
      if (!session) {
        return fail("Not authenticated", 401);
      }

      const { id } = await params;
      if (!ObjectId.isValid(id)) {
        return fail("Free test not found", 404);
      }

      const parsed = submitSchema.safeParse(await request.json());
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
      }

      await ensureIndexes();
      const freeTestId = new ObjectId(id);
      const userId = new ObjectId(session.userId);
      const attempts = await freeTestAttemptsCol();
      const attempt = (await attempts.findOne({
        _id: new ObjectId(parsed.data.attemptId),
        userId,
        freeTestId,
        activeLock: true,
        status: "in-progress",
      })) as FreeTestAttempt | null;

      if (!attempt) {
        return fail("Active attempt not found", 404);
      }

      const freeTest = await (
        await freeTestsCol()
      ).findOne({
        _id: freeTestId,
      });

      if (!freeTest) {
        return fail("Free test not found", 404);
      }

      const refs = freeTest.questions ?? [];
      const marksByQuestionId = new Map(
        refs.map((reference) => [
          `${reference.sourceCollection}:${reference.questionId.toString()}`,
          reference.marks,
        ])
      );
      const preliminaryQuestions = await preliminaryQuestionsCol();
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      let score = 0;
      let totalMarks = 0;

      for (const answer of attempt.answers) {
        const savedMarks =
          answer.marks ??
          marksByQuestionId.get(
            `${answer.sourceCollection}:${answer.questionId.toString()}`
          ) ??
          0;
        totalMarks += savedMarks;

        if (answer.sourceCollection === "written_questions") {
          skippedCount += 1;
          continue;
        }

        if (answer.selectedOptionIndex === null) {
          skippedCount += 1;
          continue;
        }

        const question = await preliminaryQuestions.findOne({
          _id: answer.questionId,
        });

        if (!question || !("correctOptionIndex" in question)) {
          skippedCount += 1;
          continue;
        }

        if (answer.selectedOptionIndex === question.correctOptionIndex) {
          correctCount += 1;
          score += savedMarks;
        } else {
          wrongCount += 1;
        }
      }

      const submittedAt = new Date();
      const updateResult = await attempts.updateOne(
        {
          _id: attempt._id,
          userId,
          activeLock: true,
          status: "in-progress",
        },
        {
          $set: {
            score,
            correctCount,
            wrongCount,
            skippedCount,
            submittedAt,
            status: "submitted",
            activeLock: false,
            autoSubmitReason: parsed.data.reason,
            updatedAt: submittedAt,
          },
        }
      );

      if (updateResult.modifiedCount !== 1) {
        return fail("This attempt has already been submitted.", 409);
      }

      const passMarkPercent =
        attempt.passMarkPercent ?? freeTest.passMarkPercent;

      return ok({
        attempt: {
          id: attempt._id.toString(),
          score,
          correctCount,
          wrongCount,
          skippedCount,
          totalQuestions: attempt.answers.length,
          passMarkPercent,
          passed:
            totalMarks > 0
              ? (score / totalMarks) * 100 >= passMarkPercent
              : false,
        },
      });
    } catch (error) {
      console.error("Submit free test error", error);
      return fail("Server error", 500);
    }
  }
);
