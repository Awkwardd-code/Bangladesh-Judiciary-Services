import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { freeTestAttemptsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

const transitionSchema = z.object({
  attemptId: z.string().regex(/^[a-f\d]{24}$/i),
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

      const parsed = transitionSchema.safeParse(await request.json());
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
      }

      await ensureIndexes();
      const attempts = await freeTestAttemptsCol();
      const attempt = await attempts.findOne({
        _id: new ObjectId(parsed.data.attemptId),
        freeTestId: new ObjectId(id),
        userId: new ObjectId(session.userId),
        activeLock: true,
        status: "in-progress",
      });

      if (!attempt) {
        return fail("Active attempt not found", 404);
      }

      if (attempt.currentPhase === "written") {
        return ok({
          currentPhase: "written",
          phaseStartedAt:
            attempt.phaseStartedAt?.toISOString() ??
            attempt.startedAt.toISOString(),
          expiresAt: attempt.expiresAt.toISOString(),
        });
      }

      const hasWrittenAnswers = attempt.answers.some(
        (answer) => answer.sourceCollection === "written_questions"
      );
      const writtenDuration =
        attempt.writtenDurationMinutes ??
        attempt.preliminaryDurationMinutes ??
        0;

      if (!hasWrittenAnswers || writtenDuration <= 0) {
        return fail("This attempt has no written phase.", 400);
      }

      const phaseStartedAt = new Date();
      const expiresAt = new Date(
        phaseStartedAt.getTime() + writtenDuration * 60_000
      );
      const result = await attempts.updateOne(
        {
          _id: attempt._id,
          activeLock: true,
          status: "in-progress",
          currentPhase: { $ne: "written" },
        },
        {
          $set: {
            currentPhase: "written",
            phaseStartedAt,
            writtenEndsAt: expiresAt,
            expiresAt,
            updatedAt: phaseStartedAt,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        return fail(
          "Unable to start the written phase. Refresh and retry.",
          409
        );
      }

      return ok({
        currentPhase: "written",
        phaseStartedAt: phaseStartedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error("Transition free test phase error", error);
      return fail("Server error", 500);
    }
  }
);
