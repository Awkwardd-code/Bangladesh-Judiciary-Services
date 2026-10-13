import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { examAttemptsCol, examsCol } from "@/lib/collections";
import { deleteFile, uploadPdf } from "@/lib/cloudinary";
import { ensureIndexes } from "@/lib/indexes";

const answerSchema = z.object({
  attemptId: z.string().regex(/^[a-f\d]{24}$/i),
  questionId: z.string().regex(/^[a-f\d]{24}$/i),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    if (!session) {
      return fail("Not authenticated.", 401);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    await ensureIndexes();
    const examId = new ObjectId(id);
    const userId = new ObjectId(session.userId);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }

    if (exam.kind === "written") {
      const form = await request.formData();
      const attemptId = String(form.get("submissionId") ?? "");
      const questionId = String(form.get("questionId") ?? "");
      const file = form.get("file");

      if (
        !ObjectId.isValid(attemptId) ||
        !ObjectId.isValid(questionId) ||
        !(file instanceof File) ||
        file.type !== "application/pdf" ||
        file.size > 10 * 1024 * 1024
      ) {
        return fail("Upload a PDF file no larger than 10 MB.", 400);
      }

      const attempts = await examAttemptsCol();
      const attemptObjectId = new ObjectId(attemptId);
      const attempt = await attempts.findOne({
        _id: attemptObjectId,
        examId,
        userId,
        activeLock: true,
        status: "in-progress",
      });
      if (!attempt) {
        return fail("Exam attempt not found.", 404);
      }
      if (attempt.expiresAt.getTime() <= Date.now()) {
        return fail("This exam attempt has expired.", 410);
      }

      const questionObjectId = new ObjectId(questionId);
      const answer = attempt.answers.find((item) =>
        item.questionId.equals(questionObjectId),
      );
      if (!answer) {
        return fail("Question not found in this attempt.", 404);
      }
      if (answer.pdfUrl) {
        return fail("This answer is already locked.", 409);
      }

      const upload = await uploadPdf(
        Buffer.from(await file.arrayBuffer()),
        `bjs-prep/exams/written/submissions/${session.userId}`,
      );
      const uploadedAt = new Date();
      const result = await attempts.updateOne(
        {
          _id: attemptObjectId,
          examId,
          userId,
          activeLock: true,
          status: "in-progress",
          "answers.questionId": questionObjectId,
          "answers.pdfUrl": null,
        },
        {
          $set: {
            "answers.$.pdfUrl": upload.secureUrl,
            "answers.$.pdfPublicId": upload.publicId,
            "answers.$.answeredAt": uploadedAt,
            updatedAt: uploadedAt,
          },
        },
      );

      if (result.modifiedCount !== 1) {
        await deleteFile(upload.publicId);
        return fail("This answer is already locked.", 409);
      }

      return ok({
        locked: true,
        pdfUrl: upload.secureUrl,
        uploadedAt: uploadedAt.toISOString(),
      });
    }

    const parsed = answerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid answer.", 400);
    }

    const attemptId = new ObjectId(parsed.data.attemptId);
    const questionId = new ObjectId(parsed.data.questionId);
    const attempts = await examAttemptsCol();
    const attempt = await attempts.findOne({
      _id: attemptId,
      examId,
      userId,
      activeLock: true,
      status: "in-progress",
    });
    if (!attempt) {
      return fail("Exam attempt not found.", 404);
    }
    if (attempt.expiresAt.getTime() <= Date.now()) {
      return fail("This exam attempt has expired.", 410);
    }

    const answer = attempt.answers.find((item) =>
      item.questionId.equals(questionId),
    );
    if (!answer) {
      return fail("Question not found in this attempt.", 404);
    }
    if (answer.selectedOptionIndex !== null) {
      return fail("This answer is already locked.", 409);
    }

    const now = new Date();
    await attempts.updateOne(
      {
        _id: attemptId,
        "answers.questionId": questionId,
        "answers.selectedOptionIndex": null,
      },
      {
        $set: {
          "answers.$.selectedOptionIndex": parsed.data.selectedOptionIndex,
          "answers.$.answeredAt": now,
          updatedAt: now,
        },
      },
    );

    return ok({ locked: true });
  } catch (error) {
    console.error("Save unified exam answer error", error);
    return fail("Server error", 500);
  }
}
