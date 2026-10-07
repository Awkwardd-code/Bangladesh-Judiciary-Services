import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import {
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard(
  { kind: "session" },
  async (request, { params, session }) => {
    try {
      const { id } = params;
      if (!ObjectId.isValid(id)) return fail("Exam not found.", 404);
      await ensureIndexes();

      const attemptId = new URL(request.url).searchParams.get("attemptId");
      if (attemptId && !ObjectId.isValid(attemptId)) {
        return fail("Attempt not found.", 404);
      }
      const filter = {
        ...(attemptId ? { _id: new ObjectId(attemptId) } : {}),
        examId: new ObjectId(id),
        userId: new ObjectId(session!.userId),
        status: {
          $in: ["submitted", "auto-submitted", "expired"] as const,
        },
      };
      const attempt = await (await preliminaryAttemptsCol()).findOne(filter, {
        sort: { submittedAt: -1 },
      });
      if (!attempt) return ok({ attempt: null });

      const exam = await (await preliminaryExamsCol()).findOne({
        _id: attempt.examId,
      });
      if (!exam) return fail("Exam not found.", 404);

      const questionIds = attempt.answers.map((answer) => answer.questionId);
      const questions = await (await preliminaryQuestionsCol())
        .find({ _id: { $in: questionIds }, examId: attempt.examId })
        .toArray();
      const questionMap = new Map(
        questions.map((question) => [question._id.toString(), question]),
      );
      const attemptTotalMarks = attempt.answers.reduce(
        (total, answer) =>
          total +
          (questionMap.get(answer.questionId.toString())?.marks ?? 0),
        0,
      );

      return ok({
        attempt: {
          id: attempt._id.toString(),
          score: attempt.score,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          skippedCount: attempt.skippedCount,
          submittedAt: attempt.submittedAt?.toISOString() ?? null,
          autoSubmitReason: attempt.autoSubmitReason ?? null,
          status: attempt.status,
          passMarkPercent: null,
        },
        exam: {
          id: exam._id.toString(),
          title: exam.title,
          totalMarks: attemptTotalMarks,
          durationMinutes: exam.durationMinutes,
        },
        questions: attempt.answers.flatMap((answer, position) => {
          const question = questionMap.get(answer.questionId.toString());
          if (!question) return [];
          const selectedOptionIndex = answer.selectedOptionIndex;
          return [
            {
              position,
              questionId: question._id.toString(),
              questionText: question.questionText,
              options: question.options,
              correctOptionIndex: question.correctOptionIndex,
              selectedOptionIndex,
              isCorrect:
                selectedOptionIndex !== null &&
                selectedOptionIndex === question.correctOptionIndex,
              skipped: selectedOptionIndex === null,
              marks: question.marks,
              subject: question.subject ?? "General",
              explanation: question.explanation,
            },
          ];
        }),
      });
    } catch (error) {
      console.error("Get preliminary result error", error);
      return fail("Server error", 500);
    }
  },
);
