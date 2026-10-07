import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { checkExamAccess, examAccessError } from "@/lib/exam-access";
import { checkExamWindow } from "@/lib/exam-window";
import {
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import type { WrittenSubmission } from "@/lib/types/exam";

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

      const examId = new ObjectId(id);
      const userId = new ObjectId(session.userId);

      await ensureIndexes();

      const exam = await (await writtenExamsCol()).findOne({ _id: examId });

      if (!exam) {
        return fail("Exam not found", 404);
      }

      const window = checkExamWindow(exam);

      if (process.env.NODE_ENV !== "production") {
        console.log("[written-exam/start]", {
          examId: id,
          status: exam.status,
          scheduledAt: exam.scheduledAt,
          closesAt: exam.closesAt,
          windowOpen: window.open,
          windowReason: window.reason,
        });
      }

      const access = await checkExamAccess(userId, examId, "written");
      if (!access.allowed) {
        const accessError = examAccessError(access);
        return fail(accessError.message, accessError.status, accessError.extra);
      }

      const active = await getActiveExam(userId);

      const allQuestions = await (
        await writtenQuestionsCol()
      )
        .find({ examId })
        .sort({ order: 1 })
        .toArray();

      if (
        active &&
        active.kind === "written" &&
        active.examId.toString() === examId.toString()
      ) {
        const submission = await (
          await writtenSubmissionsCol()
        ).findOne({
          _id: active.submissionId,
          userId,
          examId,
          activeLock: true,
        });

        if (submission) {
          const selectedQuestionIds = submission.selectedQuestionIds ?? [];
          const selectedQuestions =
            selectedQuestionIds.length > 0
              ? selectedQuestionIds
                  .map((questionId) =>
                    allQuestions.find((question) =>
                      question._id.equals(questionId)
                    )
                  )
                  .filter((question) => question !== undefined)
              : allQuestions;

          return ok({
            submission,
            exam: serializeExam(exam),
            questions: selectedQuestions.map((question, position) => ({
              id: question._id.toString(),
              position,
              source: "written_questions" as const,
              questionText: question.questionText,
              maxMarks: question.maxMarks,
              marks: question.maxMarks,
              subject: question.subject ?? "General",
            })),
          });
        }
      }

      if (allQuestions.length === 0) {
        return fail("This exam has no questions yet", 400);
      }

      const targetCount =
        exam.questionsPerAttempt && exam.questionsPerAttempt > 0
          ? Math.min(exam.questionsPerAttempt, allQuestions.length)
          : allQuestions.length;

      let selectedQuestions = allQuestions;

      if (targetCount < allQuestions.length) {
        selectedQuestions = (await (
          await writtenQuestionsCol()
        )
          .aggregate([
            { $match: { examId } },
            { $sample: { size: targetCount } },
          ])
          .toArray()) as typeof allQuestions;
      }

      const shuffledOrder = shuffleArray(
        Array.from({ length: selectedQuestions.length }, (_, index) => index)
      );

      const startedAt = new Date();
      const expiresAt = new Date(
        startedAt.getTime() + exam.durationMinutes * 60_000
      );

      const submission: WrittenSubmission = {
        _id: new ObjectId(),
        examId,
        userId,
        startedAt,
        expiresAt,
        activeLock: true,
        shuffledOrder,
        selectedQuestionIds: selectedQuestions.map((question) => question._id),
        status: "in-progress",
        answersPdfUrl: "",
        answersPdfPublicId: "",
        totalScore: 0,
        maxScore: exam.totalMarks,
        perQuestionAnswers: selectedQuestions.map((question) => ({
          questionId: question._id,
          pdfUrl: null,
          pdfPublicId: null,
          uploadedAt: null,
        })),
        perQuestionScores: [],
        createdAt: startedAt,
        updatedAt: startedAt,
      };

      await (await writtenSubmissionsCol()).insertOne(submission);

      return ok({
        submission,
        exam: serializeExam(exam),
        questions: selectedQuestions.map((question, position) => ({
          id: question._id.toString(),
          position,
          source: "written_questions" as const,
          questionText: question.questionText,
          maxMarks: question.maxMarks,
          marks: question.maxMarks,
          subject: question.subject ?? "General",
        })),
      });
    } catch (error) {
      console.error("Error starting written exam:", error);
      return fail("Server error", 500);
    }
  }
);

function serializeExam(exam: {
  _id: ObjectId;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  passMarkPercent?: number;
}) {
  return {
    id: exam._id.toString(),
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    questionsPerAttempt: exam.questionsPerAttempt ?? 0,
    passMarkPercent: exam.passMarkPercent ?? 0,
  };
}
