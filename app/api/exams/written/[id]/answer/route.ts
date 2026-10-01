import { ObjectId } from "mongodb";

import { requireSession } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { writtenSubmissionsCol } from "@/lib/collections";
import { uploadPdf } from "@/lib/cloudinary";
import { releaseExamLock } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";

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
    const formData = await request.formData();
    const submissionId = String(formData.get("submissionId") ?? "");
    const questionId = String(formData.get("questionId") ?? "");
    const file = formData.get("file");

    if (!submissionId || !questionId || !(file instanceof File)) {
      return fail("Invalid file upload", 400);
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return fail("Only PDF files are allowed", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return fail("PDF must be 10 MB or smaller", 400);
    }

    await ensureIndexes();

    const submission = await (await writtenSubmissionsCol()).findOne({
      _id: new ObjectId(submissionId),
      userId: new ObjectId(session.userId),
      examId: new ObjectId(id),
      activeLock: true,
    });

    if (!submission) {
      return fail("Submission not found", 404);
    }

    if (submission.status !== "in-progress") {
      return fail("Submission is no longer active", 409);
    }

    if (Date.now() > new Date(submission.expiresAt).getTime()) {
      await releaseExamLock("written", submission._id);
      return fail("Exam expired", 410);
    }

    if (
      submission.perQuestionAnswers.some(
        (answer) => answer.questionId.toString() === questionId,
      )
    ) {
      return fail("Answer already locked.", 403);
    }

    const fileBytes = Buffer.from(await file.arrayBuffer());
    const upload = await uploadPdf(
      fileBytes,
      `bjs-prep/exams/written/submissions/${session.userId}/${submissionId}`,
    );

    await (await writtenSubmissionsCol()).updateOne(
      { _id: submission._id },
      {
        $push: {
          perQuestionAnswers: {
            questionId: new ObjectId(questionId),
            pdfUrl: upload.secureUrl,
            pdfPublicId: upload.publicId,
            uploadedAt: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    return ok({ locked: true });
  } catch (error) {
    console.error("Error uploading written answer:", error);
    return fail("Server error", 500);
  }
}
