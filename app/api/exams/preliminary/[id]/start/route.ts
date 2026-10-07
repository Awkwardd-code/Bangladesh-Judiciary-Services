import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { checkExamAccess, examAccessError } from "@/lib/exam-access";
import { checkExamWindow } from "@/lib/exam-window";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import type { PreliminaryAttempt, PreliminaryQuestion } from "@/lib/types/exam";

export const POST = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
    try {
      if (!session) {
        return fail("Not authenticated", 401);
      }

      const { id } = await params;

      if (!ObjectId.isValid(id)) {
        return fail("Exam not found", 404);
      }

      await ensureIndexes();

      const examId = new ObjectId(id);
      const userId = new ObjectId(session.userId);
      const exams = await preliminaryExamsCol();
      const exam = await exams.findOne({ _id: examId });

      if (!exam) {
        return fail("Exam not found", 404);
      }

      if (exam.status !== "published") {
        return fail("This exam is not available.", 403);
      }

      const window = checkExamWindow(exam);

      if (!window.open) {
        return fail(
          window.reason === "not-yet-open"
            ? `This exam opens on ${window.opensAt?.toLocaleString() ?? "a future date"}.`
            : `This exam closed on ${window.closesAt?.toLocaleString() ?? "a past date"}.`,
          403
        );
      }

      const access = await checkExamAccess(userId, examId, "preliminary");

      if (!access.allowed) {
        const accessError = examAccessError(access);
        return fail(accessError.message, accessError.status, accessError.extra);
      }

      const attempts = await preliminaryAttemptsCol();
      const active = await getActiveExam(userId);

      if (
        active &&
        active.examId.equals(examId) &&
        active.kind === "preliminary"
      ) {
        const existing = await attempts.findOne({
          _id: active.attemptId,
          userId,
          examId,
          activeLock: true,
          status: "in-progress",
        });

        if (existing && existing.expiresAt.getTime() > Date.now()) {
          const questionIds = existing.answers.map(
            (answer) => answer.questionId
          );
          const currentQuestions = (await (
            await preliminaryQuestionsCol()
          )
            .find({ _id: { $in: questionIds }, examId })
            .toArray()) as PreliminaryQuestion[];
          const questionsById = new Map(
            currentQuestions.map((question) => [
              question._id.toString(),
              question,
            ])
          );

          return ok({
            attempt: serializeAttempt(existing),
            exam: serializeExam(exam),
            questions: existing.answers.flatMap((answer, position) => {
              const question = questionsById.get(answer.questionId.toString());

              return question
                ? [
                    {
                      id: question._id.toString(),
                      position,
                      source: "preliminary_questions" as const,
                      questionText: question.questionText,
                      options: question.options,
                      marks: question.marks,
                      subject: question.subject ?? "General",
                    },
                  ]
                : [];
            }),
          });
        }

        if (existing) {
          await attempts.updateOne(
            { _id: existing._id, activeLock: true },
            {
              $set: {
                status: "expired",
                submittedAt: new Date(),
                activeLock: false,
                autoSubmitReason: "time-expired",
                updatedAt: new Date(),
              },
            }
          );
        }
      } else if (active) {
        return fail("You already have an exam in progress.", 409, {
          activeExamId: active.examId.toString(),
          activeExamKind: active.kind,
        });
      }

      const questionsCollection = await preliminaryQuestionsCol();
      const totalAvailable = await questionsCollection.countDocuments({
        examId,
      });

      if (totalAvailable === 0) {
        return fail("This exam has no questions.", 400);
      }

      const required = exam.questionsPerAttempt ?? 0;
      const target =
        required > 0 ? Math.min(required, totalAvailable) : totalAvailable;
      const picked = (await questionsCollection
        .aggregate<PreliminaryQuestion>([
          { $match: { examId } },
          { $sample: { size: target } },
        ])
        .toArray()) as PreliminaryQuestion[];
      const shuffledOrder = shuffleArray(
        Array.from({ length: picked.length }, (_, index) => index)
      );
      const startedAt = new Date();
      const expiresAt = new Date(
        startedAt.getTime() + exam.durationMinutes * 60_000
      );
      const attempt: PreliminaryAttempt = {
        _id: new ObjectId(),
        examId,
        userId,
        startedAt,
        expiresAt,
        answers: picked.map((question) => ({
          questionId: question._id,
          selectedOptionIndex: null,
          answeredAt: null,
        })),
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: picked.length,
        status: "in-progress",
        activeLock: true,
        shuffledOrder,
        createdAt: startedAt,
        updatedAt: startedAt,
      };

      await attempts.insertOne(attempt);

      return ok({
        attempt: serializeAttempt(attempt),
        exam: serializeExam(exam),
        questions: picked.map((question, position) => ({
          id: question._id.toString(),
          position,
          source: "preliminary_questions" as const,
          questionText: question.questionText,
          options: question.options,
          marks: question.marks,
          subject: question.subject ?? "General",
        })),
      });
    } catch (error) {
      console.error("Error starting preliminary exam:", error);
      return fail("Server error", 500);
    }
  }
);

function serializeAttempt(attempt: PreliminaryAttempt) {
  return {
    id: attempt._id.toString(),
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    shuffledOrder: attempt.shuffledOrder,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId.toString(),
      selectedOptionIndex: answer.selectedOptionIndex,
      answeredAt: answer.answeredAt?.toISOString() ?? null,
    })),
  };
}

function serializeExam(exam: {
  _id: ObjectId;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  negativeMarking?: number;
}) {
  return {
    id: exam._id.toString(),
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    questionsPerAttempt: exam.questionsPerAttempt ?? 0,
    negativeMarking: exam.negativeMarking ?? 0,
    passMarkPercent: null,
  };
}
