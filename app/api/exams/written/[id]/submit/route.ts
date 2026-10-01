import { ObjectId } from "mongodb";
import { z } from "zod";

import { requireSession } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { writtenQuestionsCol, writtenSubmissionsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

const submitSchema = z.object({
  submissionId: z.string().min(1),
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

    const { submissionId, reason } = parsed.data;
    const examId = new ObjectId(id);
    const userId = new ObjectId(session.userId);

    await ensureIndexes();

    const submission = await (await writtenSubmissionsCol()).findOne({
      _id: new ObjectId(submissionId),
      userId,
      examId,
      activeLock: true,
    });

    if (!submission) {
      return fail("Submission not found", 404);
    }

    const questions = await (await writtenQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    if (reason === "manual") {
      const missing = questions.filter(
        (question) =>
          !submission.perQuestionAnswers.some(
            (answer) => answer.questionId.toString() === question._id.toString(),
          ),
      );

      if (missing.length > 0) {
        return fail(
          "Please upload answers for every question before submitting.",
          400,
        );
      }
    }

    const submittedAt = new Date();

    await (await writtenSubmissionsCol()).updateOne(
      { _id: submission._id },
      {
        $set: {
          status: "submitted",
          activeLock: false,
          submittedAt,
          autoSubmitReason: reason,
          answersPdfUrl: "",
          updatedAt: submittedAt,
        },
      },
    );

    return ok({
      submission: {
        ...submission,
        status: "submitted",
        activeLock: false,
        submittedAt,
        autoSubmitReason: reason,
        answersPdfUrl: "",
        updatedAt: submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting written exam:", error);
    return fail("Server error", 500);
  }
}
