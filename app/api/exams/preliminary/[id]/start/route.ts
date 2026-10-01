import { ObjectId } from "mongodb";

import { withGuard } from "@/lib/route-guard";
import { ok, fail } from "@/lib/api-response";
import { checkExamAccess, examAccessError } from "@/lib/exam-access";
import { preliminaryAttemptsCol, preliminaryExamsCol, preliminaryQuestionsCol } from "@/lib/collections";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import type { PreliminaryAttempt } from "@/lib/types/exam";

export const POST = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
  try {
    if (!session) {
      return fail("Not authenticated", 401);
    }

    const id = params.id;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found", 404);
    }

    const examId = new ObjectId(id);
    const userId = new ObjectId(session.userId);

    const access = await checkExamAccess(userId, examId, "preliminary");
    if (!access.allowed) {
      const accessError = examAccessError(access);
      return fail(accessError.message, accessError.status, accessError.extra);
    }

    await ensureIndexes();

    const active = await getActiveExam(userId);

    if (
      active &&
      active.kind === "preliminary" &&
      active.examId.toString() === examId.toString()
    ) {
      const attempt = await (await preliminaryAttemptsCol()).findOne({
        _id: active.attemptId,
        userId,
        examId,
        activeLock: true,
      });

      if (attempt) {
        return ok({ attempt });
      }
    }

    const exam = await (await preliminaryExamsCol()).findOne({ _id: examId });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    const questions = await (await preliminaryQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    if (questions.length === 0) {
      return fail("This exam has no questions yet", 400);
    }

    const shuffledOrder = shuffleArray(
      Array.from({ length: questions.length }, (_, index) => index),
    );

    const collection = await preliminaryAttemptsCol();
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + exam.durationMinutes * 60_000,
    );

    const attempt: PreliminaryAttempt = {
      _id: new ObjectId(),
      examId,
      userId,
      startedAt,
      expiresAt,
      answers: questions.map((question) => ({
        questionId: question._id,
        selectedOptionIndex: null,
        answeredAt: null,
      })),
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: questions.length,
      status: "in-progress",
      activeLock: true,
      shuffledOrder,
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    await collection.insertOne(attempt);

    return ok({ attempt });
  } catch (error) {
    console.error("Error starting preliminary exam:", error);
    return fail("Server error", 500);
  }
  },
);
