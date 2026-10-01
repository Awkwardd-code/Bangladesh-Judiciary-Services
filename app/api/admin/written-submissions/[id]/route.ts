import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  usersCol,
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import type { WrittenQuestion, WrittenSubmission } from "@/lib/types/exam";
import { gradeSubmissionSchema } from "@/lib/validators/admin";

type RouteContext = { params: Promise<{ id: string }> };

function serializeSubmission(submission: WrittenSubmission | null) {
  if (!submission) {
    return null;
  }

  return {
    ...submission,
    _id: submission._id.toString(),
    examId: submission.examId.toString(),
    userId: submission.userId.toString(),
    gradedBy: submission.gradedBy?.toString(),
    perQuestionScores: submission.perQuestionScores.map((score) => ({
      ...score,
      questionId: score.questionId.toString(),
    })),
  };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Submission not found", 404);
    }

    const submission = await (
      await writtenSubmissionsCol()
    ).findOne({
      _id: new ObjectId(id),
    });

    if (!submission) {
      return fail("Submission not found", 404);
    }

    const [user, exam, questions] = await Promise.all([
      (await usersCol()).findOne({ _id: submission.userId }),
      (await writtenExamsCol()).findOne({ _id: submission.examId }),
      (await writtenQuestionsCol())
        .find({ examId: submission.examId })
        .sort({ order: 1 })
        .toArray(),
    ]);

    return ok({
      submission: serializeSubmission(submission),
      user: user
        ? { id: user._id.toString(), name: user.name, email: user.email }
        : null,
      exam: exam
        ? {
            id: exam._id.toString(),
            title: exam.title,
            totalMarks: exam.totalMarks,
          }
        : null,
      questions: questions.map(serializeQuestion),
    });
  } catch (error) {
    console.error("Get written submission error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = gradeSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid grades", 400);
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Submission not found", 404);
    }

    const submissions = await writtenSubmissionsCol();
    const submissionId = new ObjectId(id);
    const submission = await submissions.findOne({ _id: submissionId });

    if (!submission) {
      return fail("Submission not found", 404);
    }

    const questions = await (
      await writtenQuestionsCol()
    )
      .find({ examId: submission.examId })
      .sort({ order: 1 })
      .toArray();
    const questionById = new Map(
      questions.map((question) => [question._id.toString(), question]),
    );
    const submittedScores = new Map<string, number>();
    const submittedComments = new Map<string, string>();

    for (const score of parsed.data.perQuestionScores) {
      const question = questionById.get(score.questionId);

      if (!question) {
        return fail("A score references a question outside this exam.", 400);
      }

      if (submittedScores.has(score.questionId)) {
        return fail("Each question can only be graded once.", 400);
      }

      if (score.awardedMarks > question.maxMarks) {
        return fail(
          `Awarded marks exceed the maximum for question ${question.order}.`,
          400,
        );
      }

      submittedScores.set(score.questionId, score.awardedMarks);
      submittedComments.set(score.questionId, score.comment ?? "");
    }

    const perQuestionScores = questions.map((question) => ({
      questionId: question._id,
      awardedMarks: submittedScores.get(question._id.toString()) ?? 0,
      comment: submittedComments.get(question._id.toString()) ?? "",
    }));
    const totalScore = perQuestionScores.reduce(
      (sum, score) => sum + score.awardedMarks,
      0,
    );
    const maxScore = questions.reduce(
      (sum, question) => sum + question.maxMarks,
      0,
    );

    await submissions.updateOne(
      { _id: submissionId },
      {
        $set: {
          perQuestionScores,
          totalScore,
          maxScore,
          feedback: parsed.data.feedback ?? "",
          status: "graded",
          gradedBy: new ObjectId(session.userId),
          gradedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    return ok({
      submission: serializeSubmission(
        await submissions.findOne({ _id: submissionId }),
      ),
    });
  } catch (error) {
    console.error("Grade written submission error", error);
    return fail("Server error", 500);
  }
}

function serializeQuestion(question: WrittenQuestion) {
  return {
    ...question,
    _id: question._id.toString(),
    examId: question.examId.toString(),
  };
}
