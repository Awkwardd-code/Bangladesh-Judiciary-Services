import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  examAttemptsCol,
  examQuestionsCol,
  examsCol,
  usersCol,
} from "@/lib/collections";
import { gradeSubmissionSchema } from "@/lib/validators/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam attempt not found.", 404);
    }

    const attempt = await (await examAttemptsCol()).findOne({
      _id: new ObjectId(id),
    });
    if (!attempt) {
      return fail("Exam attempt not found.", 404);
    }
    if (attempt.status === "in-progress") {
      return fail("An in-progress attempt is not ready for review.", 409);
    }

    const exam = await (await examsCol()).findOne({ _id: attempt.examId });
    if (!exam || exam.kind !== "written") {
      return fail("Written exam attempt not found.", 404);
    }

    const [user, questions] = await Promise.all([
      (await usersCol()).findOne({ _id: attempt.userId }),
      (await examQuestionsCol())
        .find({
          examId: exam._id,
          _id: { $in: attempt.answers.map((answer) => answer.questionId) },
        })
        .toArray(),
    ]);
    const questionsById = new Map(
      questions.map((question) => [question._id.toString(), question]),
    );
    const gradesByQuestion = new Map(
      (attempt.perQuestionScores ?? []).map((grade) => [
        grade.questionId.toString(),
        grade,
      ]),
    );

    return ok({
      attempt: {
        id: attempt._id.toString(),
        status: attempt.status,
        score: attempt.score,
        maxScore: exam.totalMarks,
        feedback: attempt.feedback ?? "",
      },
      exam: {
        id: exam._id.toString(),
        title: exam.title,
        totalMarks: exam.totalMarks,
      },
      user: user
        ? { id: user._id.toString(), name: user.name, email: user.email }
        : null,
      questions: attempt.answers.flatMap((answer) => {
        const question = questionsById.get(answer.questionId.toString());
        if (!question) {
          return [];
        }
        const grade = gradesByQuestion.get(question._id.toString());

        return [{
          id: question._id.toString(),
          order: question.order,
          questionText: question.questionText,
          subject: question.subject ?? "General",
          maxMarks: question.maxMarks ?? question.marks,
          pdfUrl: answer.pdfUrl ?? null,
          awardedMarks: grade?.awardedMarks ?? 0,
          comment: grade?.comment ?? "",
        }];
      }),
    });
  } catch (error) {
    console.error("Get unified written attempt for grading error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return fail("Forbidden", 403);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam attempt not found.", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.", 400);
    }
    const parsed = gradeSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid grades.", 400);
    }

    const attemptId = new ObjectId(id);
    const attempts = await examAttemptsCol();
    const attempt = await attempts.findOne({ _id: attemptId });
    if (!attempt) {
      return fail("Exam attempt not found.", 404);
    }
    if (attempt.status === "in-progress") {
      return fail("An in-progress attempt cannot be graded.", 409);
    }

    const exam = await (await examsCol()).findOne({ _id: attempt.examId });
    if (!exam || exam.kind !== "written") {
      return fail("Written exam attempt not found.", 404);
    }

    const questionIds = attempt.answers.map((answer) => answer.questionId);
    const questions = await (await examQuestionsCol())
      .find({ examId: exam._id, _id: { $in: questionIds } })
      .toArray();
    const questionById = new Map(
      questions.map((question) => [question._id.toString(), question]),
    );
    const submittedScores = new Map<string, number>();
    const submittedComments = new Map<string, string>();

    for (const grade of parsed.data.perQuestionScores) {
      const question = questionById.get(grade.questionId);
      if (!question) {
        return fail("A score references a question outside this attempt.", 400);
      }
      if (submittedScores.has(grade.questionId)) {
        return fail("Each question can only be graded once.", 400);
      }
      if (grade.awardedMarks > (question.maxMarks ?? question.marks)) {
        return fail(
          `Awarded marks exceed the maximum for question ${question.order}.`,
          400,
        );
      }
      submittedScores.set(grade.questionId, grade.awardedMarks);
      submittedComments.set(grade.questionId, grade.comment ?? "");
    }

    const perQuestionScores = questions.map((question) => ({
      questionId: question._id,
      awardedMarks: submittedScores.get(question._id.toString()) ?? 0,
      comment: submittedComments.get(question._id.toString()) ?? "",
    }));
    const score = perQuestionScores.reduce(
      (total, grade) => total + grade.awardedMarks,
      0,
    );
    const now = new Date();
    const update = await attempts.updateOne(
      { _id: attemptId, status: { $ne: "in-progress" } },
      {
        $set: {
          perQuestionScores,
          score,
          feedback: parsed.data.feedback ?? "",
          status: "graded",
          gradedBy: new ObjectId(session.userId),
          gradedAt: now,
          updatedAt: now,
        },
      },
    );
    if (update.modifiedCount !== 1) {
      return fail("The attempt could not be graded.", 409);
    }

    return ok({ score, status: "graded" });
  } catch (error) {
    console.error("Grade unified written exam attempt error", error);
    return fail("Server error", 500);
  }
}
