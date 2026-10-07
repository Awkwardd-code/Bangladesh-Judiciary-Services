import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import {
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
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
        return fail("Submission not found.", 404);
      }
      const submission = await (await writtenSubmissionsCol()).findOne(
        {
          ...(attemptId ? { _id: new ObjectId(attemptId) } : {}),
          examId: new ObjectId(id),
          userId: new ObjectId(session!.userId),
          status: { $in: ["submitted", "under-review", "graded"] },
        },
        { sort: { submittedAt: -1 } },
      );
      if (!submission) return ok({ attempt: null });

      const exam = await (await writtenExamsCol()).findOne({
        _id: submission.examId,
      });
      if (!exam) return fail("Exam not found.", 404);

      const answers = submission.perQuestionAnswers ?? [];
      const questionIds = answers.map((answer) => answer.questionId);
      const questions = await (await writtenQuestionsCol())
        .find({ _id: { $in: questionIds }, examId: submission.examId })
        .toArray();
      const questionMap = new Map(
        questions.map((question) => [question._id.toString(), question]),
      );
      const scores = new Map(
        (submission.perQuestionScores ?? []).map((score) => [
          score.questionId.toString(),
          score,
        ]),
      );

      return ok({
        attempt: {
          id: submission._id.toString(),
          score: submission.totalScore,
          correctCount: 0,
          wrongCount: 0,
          skippedCount: 0,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
          autoSubmitReason: submission.autoSubmitReason ?? null,
          status: submission.status,
          feedback: submission.feedback ?? null,
          awaitingReview:
            submission.status === "submitted" ||
            submission.status === "under-review",
          passMarkPercent: null,
        },
        exam: {
          id: exam._id.toString(),
          title: exam.title,
          totalMarks: submission.maxScore || exam.totalMarks,
          durationMinutes: exam.durationMinutes,
        },
        questions: answers.flatMap((answer, position) => {
          const question = questionMap.get(answer.questionId.toString());
          if (!question) return [];
          const score = scores.get(answer.questionId.toString());
          return [
            {
              position,
              questionId: question._id.toString(),
              questionText: question.questionText,
              maxMarks: question.maxMarks,
              marks: question.maxMarks,
              subject: question.subject ?? "General",
              pdfUrl: answer.pdfUrl ?? null,
              awardedMarks:
                submission.status === "graded"
                  ? score?.awardedMarks
                  : undefined,
              comment:
                submission.status === "graded" ? score?.comment : undefined,
            },
          ];
        }),
      });
    } catch (error) {
      console.error("Get written result error", error);
      return fail("Server error", 500);
    }
  },
);
