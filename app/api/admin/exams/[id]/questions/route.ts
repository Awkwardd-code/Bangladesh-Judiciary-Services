import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { examQuestionsCol, examsCol } from "@/lib/collections";
import type { ExamQuestion } from "@/lib/types/exam";
import { examQuestionCreateSchema } from "@/lib/validators/exam";

function serializeQuestion(question: ExamQuestion) {
  return {
    ...question,
    _id: question._id.toString(),
    examId: question.examId.toString(),
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const examId = new ObjectId(id);
    if (!(await (await examsCol()).findOne({ _id: examId }))) {
      return fail("Exam not found.", 404);
    }

    const questions = await (await examQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    return ok({ questions: questions.map(serializeQuestion) });
  } catch (error) {
    console.error("List admin exam questions error", error);
    return fail("Server error", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    const parsed = examQuestionCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid question payload.",
        400,
      );
    }

    const examId = new ObjectId(id);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const questions = await examQuestionsCol();
    if (await questions.findOne({ examId, order: parsed.data.order })) {
      return fail("A question already uses this order.", 409);
    }

    const now = new Date();
    const question: ExamQuestion = {
      _id: new ObjectId(),
      examId,
      order: parsed.data.order,
      questionText: parsed.data.questionText,
      options: parsed.data.options,
      correctOptionIndex: parsed.data.correctOptionIndex,
      maxMarks: parsed.data.maxMarks,
      marks: parsed.data.options
        ? parsed.data.marks
        : parsed.data.maxMarks ?? parsed.data.marks,
      subject: parsed.data.subject,
      explanation: parsed.data.explanation,
      createdAt: now,
      updatedAt: now,
    };

    await questions.insertOne(question);
    const { totalQuestions, totalMarks } = await calculateTotals(examId, exam.kind);
    await (await examsCol()).updateOne(
      { _id: examId },
      { $set: { totalQuestions, totalMarks, updatedAt: new Date() } },
    );

    return ok({ question: serializeQuestion(question) }, 201);
  } catch (error) {
    console.error("Create admin exam question error", error);
    return fail("Server error", 500);
  }
}

async function calculateTotals(examId: ObjectId, kind: "preliminary" | "written") {
  const questions = await examQuestionsCol();
  const [totalQuestions, rows] = await Promise.all([
    questions.countDocuments({ examId }),
    questions
      .aggregate<{ totalMarks: number }>([
        { $match: { examId } },
        {
          $group: {
            _id: null,
            totalMarks: {
              $sum:
                kind === "written"
                  ? { $ifNull: ["$maxMarks", "$marks"] }
                  : "$marks",
            },
          },
        },
      ])
      .toArray(),
  ]);

  return { totalQuestions, totalMarks: Number(rows[0]?.totalMarks ?? 0) };
}
