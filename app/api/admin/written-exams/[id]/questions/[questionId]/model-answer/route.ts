import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { uploadPdf } from "@/lib/cloudinary";
import { writtenExamsCol, writtenQuestionsCol } from "@/lib/collections";

type RouteContext = {
  params: Promise<{ id: string; questionId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id, questionId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(questionId)) {
      return fail("Question not found", 404);
    }

    const examId = new ObjectId(id);
    const questionObjectId = new ObjectId(questionId);
    const exam = await (await writtenExamsCol()).findOne({ _id: examId });
    const question = await (
      await writtenQuestionsCol()
    ).findOne({
      _id: questionObjectId,
      examId,
    });

    if (!exam || !question) {
      return fail("Question not found", 404);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.type !== "application/pdf") {
      return fail("Choose a PDF model answer.", 400);
    }

    if (file.size > 20 * 1024 * 1024) {
      return fail("PDF files must be 20 MB or smaller.", 400);
    }

    const result = await uploadPdf(
      Buffer.from(await file.arrayBuffer()),
      `bjs-prep/written-model-answers/${id}`,
    );

    return ok({ url: result.secureUrl, publicId: result.publicId });
  } catch (error) {
    console.error("Upload written model answer error", error);
    return fail("Unable to upload the model answer.", 500);
  }
}
