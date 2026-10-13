import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { examQuestionsCol, examsCol } from "@/lib/collections";
import type { ExamQuestion } from "@/lib/types/exam";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { mcqImportConfirmSchema } from "@/lib/validators/question-import";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const limit = rateLimit({
      key: `exam-excel-import:${getClientIp(request)}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.", 400);
    }

    const parsed = mcqImportConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid import payload.",
        400,
      );
    }
    if (parsed.data.examId !== id) {
      return fail("Exam ID does not match the request.", 400);
    }

    const examId = new ObjectId(id);
    const exams = await examsCol();
    const exam = await exams.findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }
    if (exam.kind !== "preliminary") {
      return fail("Excel MCQ import is only available for preliminary exams.", 400);
    }

    await ensureIndexes();

    const questions = await examQuestionsCol();
    const incomingOrders = parsed.data.rows.map((row) => row.order);
    if (
      parsed.data.replaceExisting &&
      new Set(incomingOrders).size !== incomingOrders.length
    ) {
      return fail("Imported question orders must be unique.", 400);
    }

    const existingQuestions = await questions
      .find({ examId })
      .sort({ order: -1 })
      .limit(1)
      .next();
    const firstOrder = existingQuestions ? existingQuestions.order + 1 : 1;
    const now = new Date();
    const documents: ExamQuestion[] = parsed.data.rows.map((row, index) => ({
      _id: new ObjectId(),
      examId,
      order: parsed.data.replaceExisting ? row.order : firstOrder + index,
      questionText: row.questionText,
      options: row.options,
      correctOptionIndex: row.correctOptionIndex,
      marks: row.marks,
      subject: row.subject,
      explanation: row.explanation,
      createdAt: now,
      updatedAt: now,
    }));

    if (parsed.data.replaceExisting) {
      await questions.deleteMany({ examId });
    }
    await questions.insertMany(documents);

    const [totalQuestions, markRows] = await Promise.all([
      questions.countDocuments({ examId }),
      questions
        .aggregate<{ totalMarks: number }>([
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
      totalQuestions,
      totalMarks,
      message: `${documents.length} questions imported successfully.`,
    });
  } catch (error) {
    console.error("Unified exam spreadsheet import error", error);
    return fail("Unable to import questions.", 500);
  }
}
