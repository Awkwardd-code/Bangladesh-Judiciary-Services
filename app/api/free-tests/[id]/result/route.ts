import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard(
  { kind: "session" },
  async (request, { params, session }) => {
    try {
      if (!session) {
        return fail("Not authenticated", 401);
      }

      const { id } = await params;
      if (!ObjectId.isValid(id)) {
        return fail("Free test not found", 404);
      }

      const freeTestId = new ObjectId(id);
      const userId = new ObjectId(session.userId);
      const attemptId = new URL(request.url).searchParams.get("attemptId");
      if (attemptId && !ObjectId.isValid(attemptId)) {
        return fail("Attempt not found", 404);
      }
      const attempt = await (
        await freeTestAttemptsCol()
      ).findOne(
        {
          ...(attemptId ? { _id: new ObjectId(attemptId) } : {}),
          freeTestId,
          userId,
          status: { $in: ["submitted", "expired"] },
        },
        { sort: { submittedAt: -1 } }
      );

      if (!attempt) {
        return ok({ attempt: null });
      }

      const freeTest = await (
        await freeTestsCol()
      ).findOne({
        _id: freeTestId,
      });

      if (!freeTest) {
        return fail("Free test not found", 404);
      }

      const legacyRefs = freeTest.questions ?? [];
      const legacyMarks = new Map(
        legacyRefs.map((reference) => [
          `${reference.sourceCollection}:${reference.questionId.toString()}`,
          reference.marks,
        ])
      );
      const questionEntries = await Promise.all(
        attempt.answers.map(async (answer, index) => {
          const sourceCollection =
            answer.sourceCollection ??
            legacyRefs.find((reference) =>
              reference.questionId.equals(answer.questionId)
            )?.sourceCollection ??
            "preliminary_questions";
          const collection =
            sourceCollection === "preliminary_questions"
              ? await preliminaryQuestionsCol()
              : await writtenQuestionsCol();
          const question = await collection.findOne({ _id: answer.questionId });

          return {
            answer,
            index,
            sourceCollection,
            question,
            marks:
              answer.marks ??
              legacyMarks.get(
                `${sourceCollection}:${answer.questionId.toString()}`
              ) ??
              0,
          };
        })
      );
      const entryByIndex = new Map(
        questionEntries.map((entry) => [entry.index, entry])
      );
      const totalMarks = questionEntries.reduce(
        (sum, entry) => sum + entry.marks,
        0
      );
      const passMarkPercent =
        attempt.passMarkPercent ?? freeTest.passMarkPercent;
      const questions = (attempt.shuffledOrder ?? []).flatMap((index) => {
        const entry = entryByIndex.get(index);
        if (!entry) {
          return [];
        }

        const detail = entry.question;
        const correctOptionIndex =
          detail && "correctOptionIndex" in detail
            ? detail.correctOptionIndex
            : undefined;
        const options =
          detail && "options" in detail ? detail.options : undefined;
        const selectedOptionIndex = entry.answer.selectedOptionIndex;
        const isCorrect =
          entry.sourceCollection === "preliminary_questions" &&
          typeof correctOptionIndex === "number" &&
          selectedOptionIndex !== null &&
          selectedOptionIndex === correctOptionIndex;

        return [
          {
            questionId: entry.question?._id?.toString() ?? "",
            position: index,
            questionText: detail?.questionText ?? "Question unavailable",
            options,
            correctOptionIndex,
            selectedOptionIndex,
            isCorrect: Boolean(isCorrect),
            marks: entry.marks,
            subject: detail?.subject ?? "General",
            source: entry.sourceCollection,
            answerPdfUrl: entry.answer.pdfUrl ?? null,
            pdfUrl: entry.answer.pdfUrl ?? null,
          },
        ];
      });

      return ok({
          exam: {
            id: freeTest._id.toString(),
            title: freeTest.title,
            durationMinutes: freeTest.durationMinutes,
            preliminaryDurationMinutes:
              attempt.preliminaryDurationMinutes ??
              freeTest.preliminaryDurationMinutes ??
              freeTest.durationMinutes,
            writtenDurationMinutes:
              attempt.writtenDurationMinutes ??
              freeTest.writtenDurationMinutes ??
              0,
            passMarkPercent,
            totalMarks,
          },
          attempt: {
            id: attempt._id.toString(),
            score: attempt.score,
            correctCount: attempt.correctCount,
            wrongCount: attempt.wrongCount,
            skippedCount: attempt.skippedCount,
            startedAt: attempt.startedAt.toISOString(),
            submittedAt: attempt.submittedAt?.toISOString() ?? null,
            autoSubmitReason: attempt.autoSubmitReason ?? null,
            status: attempt.status,
            passMarkPercent,
          },
          shuffledOrder: attempt.shuffledOrder,
          questions,
          phaseBreakdown: {
            preliminaryDurationMinutes:
              attempt.preliminaryDurationMinutes ??
              freeTest.preliminaryDurationMinutes ??
              freeTest.durationMinutes,
            writtenDurationMinutes:
              attempt.writtenDurationMinutes ??
              freeTest.writtenDurationMinutes ??
              0,
            preliminaryStartedAt: attempt.startedAt.toISOString(),
            writtenStartedAt:
              attempt.currentPhase === "written"
                ? attempt.phaseStartedAt?.toISOString() ?? null
                : null,
          },
          pendingWrittenGrading: questionEntries.some(
            (entry) => entry.sourceCollection === "written_questions",
          ),
          passed:
            totalMarks > 0
              ? (attempt.score / totalMarks) * 100 >= passMarkPercent
              : false,
      });
    } catch (error) {
      console.error("Fetch free test result error", error);
      return fail("Server error", 500);
    }
  }
);
