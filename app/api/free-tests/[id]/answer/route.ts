import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { freeTestAttemptsCol } from "@/lib/collections";
import { deleteFile, uploadPdf } from "@/lib/cloudinary";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

const objectIdPattern = /^[a-f\d]{24}$/i;

const answerSchema = z.object({
  attemptId: z.string().regex(objectIdPattern),
  questionId: z.string().regex(objectIdPattern),
  selectedOptionIndex: z.number().int().min(0).max(3),
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

      await ensureIndexes();

      if (
        request.headers.get("content-type")?.includes("multipart/form-data")
      ) {
        const formData = await request.formData();
        const attemptId = String(
          formData.get("attemptId") ?? formData.get("submissionId") ?? ""
        );
        const questionId = String(formData.get("questionId") ?? "");
        const file = formData.get("file");

        if (
          !objectIdPattern.test(attemptId) ||
          !objectIdPattern.test(questionId) ||
          !(file instanceof File)
        ) {
          return fail("Invalid file upload", 400);
        }

        if (file.type !== "application/pdf") {
          return fail("Only PDF files are allowed", 400);
        }

        if (file.size > 10 * 1024 * 1024) {
          return fail("PDF must be 10 MB or smaller", 400);
        }

        const attempts = await freeTestAttemptsCol();
        const attempt = await attempts.findOne({
          _id: new ObjectId(attemptId),
          userId: new ObjectId(session.userId),
          freeTestId: new ObjectId(id),
          activeLock: true,
          status: "in-progress",
        });

        if (!attempt) {
          return fail("Attempt not found", 404);
        }

        const now = new Date();

        if (attempt.expiresAt.getTime() <= now.getTime()) {
          await attempts.updateOne(
            { _id: attempt._id, activeLock: true },
            {
              $set: {
                status: "expired",
                submittedAt: now,
                activeLock: false,
                autoSubmitReason: "time-expired",
                updatedAt: now,
              },
            }
          );

          return fail("Exam expired", 410);
        }

        const answer = attempt.answers.find(
          (entry) => entry.questionId.toString() === questionId
        );

        if (!answer || answer.sourceCollection !== "written_questions") {
          return fail("Written question not found in this attempt", 404);
        }

        if (attempt.currentPhase && attempt.currentPhase !== "written") {
          return fail("Written answers are not available in this phase.", 409);
        }

        if (answer.pdfUrl) {
          return fail("This answer is already locked.", 403);
        }

        const upload = await uploadPdf(
          Buffer.from(await file.arrayBuffer()),
          `bjs-prep/free-tests/submissions/${session.userId}`
        );
        const uploadedAt = new Date();
        const updateResult = await attempts.updateOne(
          {
            _id: attempt._id,
            activeLock: true,
            status: "in-progress",
            ...(attempt.currentPhase
              ? { currentPhase: attempt.currentPhase }
              : {}),
            answers: {
              $elemMatch: {
                questionId: new ObjectId(questionId),
                sourceCollection: "written_questions",
                $or: [{ pdfUrl: null }, { pdfUrl: { $exists: false } }],
              },
            },
          },
          {
            $set: {
              "answers.$.pdfUrl": upload.secureUrl,
              "answers.$.pdfPublicId": upload.publicId,
              "answers.$.uploadedAt": uploadedAt,
              updatedAt: uploadedAt,
            },
          }
        );

        if (updateResult.modifiedCount !== 1) {
          await deleteFile(upload.publicId);
          return fail("This answer is already locked.", 403);
        }

        return ok({
          locked: true,
          pdfUrl: upload.secureUrl,
        });
      }

      const parsed = answerSchema.safeParse(await request.json());

      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
      }

      const { attemptId, questionId, selectedOptionIndex } = parsed.data;
      const freeTestId = new ObjectId(id);
      const userId = new ObjectId(session.userId);
      const attempts = await freeTestAttemptsCol();
      const attempt = await attempts.findOne({
        _id: new ObjectId(attemptId),
        userId,
        freeTestId,
        activeLock: true,
      });

      if (!attempt) {
        return fail("Attempt not found", 404);
      }

      if (attempt.status !== "in-progress") {
        return fail("Exam is no longer active", 409);
      }

      if (Date.now() >= new Date(attempt.expiresAt).getTime()) {
        return fail("Exam expired.", 410);
      }

      const answerIndex = attempt.answers.findIndex(
        (answer) => answer.questionId.toString() === questionId
      );

      if (answerIndex === -1) {
        return fail("Question not in this attempt.", 404);
      }

      if (attempt.answers[answerIndex].selectedOptionIndex !== null) {
        return fail("Answer already locked.", 403);
      }

      if (
        attempt.answers[answerIndex].sourceCollection !==
        "preliminary_questions"
      ) {
        return fail(
          "This question does not accept a multiple-choice answer.",
          400
        );
      }

      if (attempt.currentPhase && attempt.currentPhase !== "preliminary") {
        return fail(
          "Preliminary answers are not available in this phase.",
          409
        );
      }

      const now = new Date();

      const updateResult = await attempts.updateOne(
        {
          _id: attempt._id,
          activeLock: true,
          status: "in-progress",
          ...(attempt.currentPhase
            ? { currentPhase: attempt.currentPhase }
            : {}),
          answers: {
            $elemMatch: {
              questionId: new ObjectId(questionId),
              sourceCollection: "preliminary_questions",
              selectedOptionIndex: null,
            },
          },
        },
        {
          $set: {
            "answers.$.selectedOptionIndex": selectedOptionIndex,
            "answers.$.answeredAt": now,
            updatedAt: now,
          },
        }
      );

      if (updateResult.modifiedCount !== 1) {
        return fail(
          "This answer is already locked or the phase has changed.",
          409
        );
      }

      return ok({ locked: true });
    } catch (error) {
      console.error("Answer free test question error", error);
      return fail("Server error", 500);
    }
  }
);
