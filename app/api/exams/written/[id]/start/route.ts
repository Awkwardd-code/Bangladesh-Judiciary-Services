import { ObjectId } from "mongodb";

import { withGuard } from "@/lib/route-guard";
import { ok, fail } from "@/lib/api-response";
import { checkExamAccess, examAccessError } from "@/lib/exam-access";
import { writtenExamsCol, writtenQuestionsCol, writtenSubmissionsCol } from "@/lib/collections";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import type { WrittenSubmission } from "@/lib/types/exam";

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

    const access = await checkExamAccess(userId, examId, "written");
    if (!access.allowed) {
      const accessError = examAccessError(access);
      return fail(accessError.message, accessError.status, accessError.extra);
    }

    await ensureIndexes();

    const active = await getActiveExam(userId);

    if (
      active &&
      active.kind === "written" &&
      active.examId.toString() === examId.toString()
    ) {
      const submission = await (await writtenSubmissionsCol()).findOne({
        _id: active.submissionId,
        userId,
        examId,
        activeLock: true,
      });

      if (submission) {
        return ok({ submission });
      }
    }

    const exam = await (await writtenExamsCol()).findOne({ _id: examId });

    if (!exam) {
      return fail("Exam not found", 404);
    }

    const questions = await (await writtenQuestionsCol())
      .find({ examId })
      .sort({ order: 1 })
      .toArray();

    if (questions.length === 0) {
      return fail("This exam has no questions yet", 400);
    }

    const shuffledOrder = shuffleArray(
      Array.from({ length: questions.length }, (_, index) => index),
    );

    const collection = await writtenSubmissionsCol();
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + exam.durationMinutes * 60_000,
    );

    const submission: WrittenSubmission = {
      _id: new ObjectId(),
      examId,
      userId,
      startedAt,
      expiresAt,
      activeLock: true,
      shuffledOrder,
      status: "in-progress",
      answersPdfUrl: "",
      answersPdfPublicId: "",
      totalScore: 0,
      maxScore: exam.totalMarks,
      perQuestionAnswers: [],
      perQuestionScores: [],
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    await collection.insertOne(submission);

    return ok({ submission });
  } catch (error) {
    console.error("Error starting written exam:", error);
    return fail("Server error", 500);
  }
  },
);
