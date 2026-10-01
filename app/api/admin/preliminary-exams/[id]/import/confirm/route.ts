import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { mcqImportConfirmSchema } from "@/lib/validators/questions-import";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const limit = rateLimit({
      key: `excel-import:${getClientIp(req)}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found", 404);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = mcqImportConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid import payload",
        400,
      );
    }

    if (parsed.data.examId !== id) {
      return fail("Exam ID does not match the request.", 400);
    }

    await ensureIndexes();

    const examId = new ObjectId(id);
    const exams = await preliminaryExamsCol();
    const exam = await exams.findOne({ _id: examId });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    const questions = await preliminaryQuestionsCol();
    const incomingOrders = parsed.data.rows.map((row) => row.order);

    if (new Set(incomingOrders).size !== incomingOrders.length) {
      return fail("Imported question orders must be unique.", 400);
    }

    if (!parsed.data.replaceExisting) {
      const orderConflict = await questions.findOne({
        examId,
        order: { $in: incomingOrders },
      });

      if (orderConflict) {
        return fail(
          "One or more question orders already exist. Enable replace or adjust the order values.",
          409,
        );
      }
    } else {
      await questions.deleteMany({ examId });
    }

    const now = new Date();
    const documents = parsed.data.rows.map((row) => ({
      _id: new ObjectId(),
      examId,
      order: row.order,
      questionText: row.questionText,
      options: row.options,
      correctOptionIndex: row.correctOptionIndex,
      marks: row.marks,
      subject: row.subject ?? "",
      explanation: row.explanation ?? "",
      createdAt: now,
      updatedAt: now,
    }));

    await questions.insertMany(documents);

    const [totalQuestions, markRows] = await Promise.all([
      questions.countDocuments({ examId }),
      questions
        .aggregate([
          { $match: { examId } },
          { $group: { _id: null, totalMarks: { $sum: "$marks" } } },
        ])
        .toArray(),
    ]);
    const totalMarks = Number(markRows[0]?.totalMarks ?? 0);

    await exams.updateOne(
      { _id: examId },
      { $set: { totalQuestions, totalMarks, updatedAt: new Date() } },
    );

    return ok({
      inserted: documents.length,
      message: `${documents.length} questions imported successfully.`,
    });
  } catch (error) {
    console.error("Confirm MCQ import error", error);
    return fail("Unable to import questions.", 500);
  }
}
