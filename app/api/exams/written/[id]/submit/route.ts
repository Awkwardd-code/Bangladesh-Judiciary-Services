import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { writtenSubmissionsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

const submitSchema = z.object({
  submissionId: z.string().regex(/^[a-f\d]{24}$/i),
  reason: z.enum(["manual", "tab-change", "visibility-hidden", "time-expired"]),
});

export const POST = withGuard(
  { kind: "session" },
  async (request, { params, session }) => {
    try {
      if (!session) {
        return fail("Not authenticated", 401);
      }

      const { id } = params;

      if (!ObjectId.isValid(id)) {
        return fail("Exam not found", 404);
      }

      const parsed = submitSchema.safeParse(await request.json());

      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
      }

      const { submissionId, reason } = parsed.data;
      const examId = new ObjectId(id);
      const userId = new ObjectId(session.userId);

      await ensureIndexes();

      const submissions = await writtenSubmissionsCol();
      const submission = await submissions.findOne({
        _id: new ObjectId(submissionId),
        userId,
        examId,
        activeLock: true,
        status: "in-progress",
      });

      if (!submission) {
        return fail("Submission not found", 404);
      }

      const submittedAt = new Date();

      const updateResult = await submissions.updateOne(
        { _id: submission._id, activeLock: true, status: "in-progress" },
        {
          $set: {
            status: "submitted",
            submittedAt,
            activeLock: false,
            autoSubmitReason: reason,
            updatedAt: submittedAt,
          },
        }
      );

      if (updateResult.modifiedCount !== 1) {
        return fail("This submission has already been submitted.", 409);
      }

      return ok({
        submission: {
          id: submission._id.toString(),
          status: "submitted",
          submittedAt,
          autoSubmitReason: reason,
        },
      });
    } catch (error) {
      console.error("Error submitting written exam:", error);
      return fail("Server error", 500);
    }
  }
);
