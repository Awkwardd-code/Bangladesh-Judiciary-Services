import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { writtenSubmissionsCol } from "@/lib/collections";
import { deleteFile, uploadPdf } from "@/lib/cloudinary";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

const objectIdPattern = /^[a-f\d]{24}$/i;

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

      const formData = await request.formData();
      const submissionId = String(formData.get("submissionId") ?? "");
      const questionId = String(formData.get("questionId") ?? "");
      const file = formData.get("file");

      if (
        !objectIdPattern.test(submissionId) ||
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

      await ensureIndexes();

      const submissions = await writtenSubmissionsCol();
      const submissionObjectId = new ObjectId(submissionId);
      const examObjectId = new ObjectId(id);
      const userObjectId = new ObjectId(session.userId);
      const submission = await submissions.findOne({
        _id: submissionObjectId,
        userId: userObjectId,
        examId: examObjectId,
        activeLock: true,
        status: "in-progress",
      });

      if (!submission) {
        return fail("Submission not found", 404);
      }

      const now = new Date();

      if (submission.expiresAt < now) {
        await submissions.updateOne(
          { _id: submission._id, activeLock: true },
          {
            $set: {
              status: "submitted",
              submittedAt: now,
              activeLock: false,
              autoSubmitReason: "time-expired",
              updatedAt: now,
            },
          }
        );

        return fail("Exam expired", 410);
      }

      const answer = submission.perQuestionAnswers.find(
        (entry) => entry.questionId.toString() === questionId
      );

      if (!answer) {
        return fail("Question not found in this submission", 404);
      }

      if (answer.pdfUrl) {
        return fail("This answer is already locked.", 403);
      }

      const upload = await uploadPdf(
        Buffer.from(await file.arrayBuffer()),
        `bjs-prep/exams/written/submissions/${session.userId}`
      );
      const uploadedAt = new Date();
      const result = await submissions.updateOne(
        {
          _id: submission._id,
          activeLock: true,
          status: "in-progress",
          perQuestionAnswers: {
            $elemMatch: {
              questionId: new ObjectId(questionId),
              $or: [{ pdfUrl: null }, { pdfUrl: { $exists: false } }],
            },
          },
        },
        {
          $set: {
            "perQuestionAnswers.$.pdfUrl": upload.secureUrl,
            "perQuestionAnswers.$.pdfPublicId": upload.publicId,
            "perQuestionAnswers.$.uploadedAt": uploadedAt,
            updatedAt: uploadedAt,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        await deleteFile(upload.publicId);
        return fail("This answer is already locked.", 403);
      }

      return ok({
        locked: true,
        pdfUrl: upload.secureUrl,
      });
    } catch (error) {
      console.error("Error uploading written answer:", error);
      return fail("Server error", 500);
    }
  }
);
