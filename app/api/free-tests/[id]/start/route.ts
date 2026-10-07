import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { checkExamWindow } from "@/lib/exam-window";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import { getFreeTestAccess } from "@/lib/free-test-quota";
import { withGuard } from "@/lib/route-guard";
import type {
  FreeTest,
  FreeTestAttempt,
  FreeTestQuestionRef,
} from "@/lib/types/free-test";

type ResolvedAttemptQuestion = {
  _id: ObjectId;
  questionText: string;
  options?: string[];
  marks: number;
  maxMarks?: number;
  subject: string;
  sourceCollection: "preliminary_questions" | "written_questions";
};

async function resolveQuestion(
  reference: FreeTestQuestionRef
): Promise<ResolvedAttemptQuestion | null> {
  const collection =
    reference.sourceCollection === "preliminary_questions"
      ? await preliminaryQuestionsCol()
      : await writtenQuestionsCol();
  const question = await collection.findOne({ _id: reference.questionId });

  if (!question) {
    return null;
  }

  if (reference.sourceCollection === "preliminary_questions") {
    if (!("correctOptionIndex" in question)) {
      return null;
    }

    return {
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      marks: reference.marks,
      subject: question.subject ?? "General",
      sourceCollection: "preliminary_questions",
    };
  }

  if (!("maxMarks" in question)) {
    return null;
  }

  return {
    _id: question._id,
    questionText: question.questionText,
    marks: reference.marks,
    maxMarks: question.maxMarks,
    subject: question.subject ?? "General",
    sourceCollection: "written_questions",
  };
}

async function loadAttemptQuestions(attempt: FreeTestAttempt) {
  const questions = await Promise.all(
    attempt.answers.map(async (answer) => {
      const reference: FreeTestQuestionRef = {
        questionId: answer.questionId,
        sourceCollection: answer.sourceCollection,
        marks: answer.marks ?? 0,
        order: 0,
      };
      const question = await resolveQuestion(reference);

      if (!question) {
        return null;
      }

      return {
        ...question,
        marks: answer.marks ?? question.marks,
      };
    })
  );

  return questions.filter(
    (question): question is ResolvedAttemptQuestion => question !== null
  );
}

function serializeQuestion(
  question: ResolvedAttemptQuestion,
  position: number
) {
  return {
    id: question._id.toString(),
    position,
    source: question.sourceCollection,
    questionText: question.questionText,
    options: question.options,
    marks: question.marks,
    maxMarks: question.maxMarks,
    subject: question.subject,
  };
}

function serializeAttempt(attempt: FreeTestAttempt) {
  return {
    id: attempt._id.toString(),
    freeTestId: attempt.freeTestId.toString(),
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    currentPhase: attempt.currentPhase,
    phaseStartedAt:
      attempt.phaseStartedAt?.toISOString() ?? attempt.startedAt.toISOString(),
    preliminaryDurationMinutes: attempt.preliminaryDurationMinutes ?? null,
    writtenDurationMinutes: attempt.writtenDurationMinutes ?? null,
    passMarkPercent: attempt.passMarkPercent ?? null,
    preliminaryEndsAt: attempt.preliminaryEndsAt?.toISOString() ?? null,
    writtenEndsAt: attempt.writtenEndsAt?.toISOString() ?? null,
    shuffledOrder: attempt.shuffledOrder,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId.toString(),
      sourceCollection: answer.sourceCollection,
      selectedOptionIndex: answer.selectedOptionIndex,
      answeredAt: answer.answeredAt?.toISOString() ?? null,
      pdfUrl: answer.pdfUrl ?? null,
      pdfPublicId: answer.pdfPublicId ?? null,
      uploadedAt: answer.uploadedAt?.toISOString() ?? null,
    })),
  };
}

function serializeFreeTest(freeTest: FreeTest) {
  const refs = freeTest.questions ?? [];
  const hasPreliminaryQuestions = refs.some(
    (reference) => reference.sourceCollection === "preliminary_questions"
  );
  const hasWrittenQuestions = refs.some(
    (reference) => reference.sourceCollection === "written_questions"
  );
  const hasExplicitPhaseDurations =
    typeof freeTest.preliminaryDurationMinutes === "number" ||
    typeof freeTest.writtenDurationMinutes === "number";
  const hasQuestionKinds = hasPreliminaryQuestions || hasWrittenQuestions;

  return {
    id: freeTest._id.toString(),
    title: freeTest.title,
    durationMinutes: hasExplicitPhaseDurations
      ? (hasPreliminaryQuestions || !hasQuestionKinds
          ? (freeTest.preliminaryDurationMinutes ?? 0)
          : 0) +
        (hasWrittenQuestions || !hasQuestionKinds
          ? (freeTest.writtenDurationMinutes ?? 0)
          : 0)
      : freeTest.durationMinutes,
    preliminaryDurationMinutes:
      freeTest.preliminaryDurationMinutes ?? freeTest.durationMinutes,
    writtenDurationMinutes: freeTest.writtenDurationMinutes ?? 0,
    writtenQuestionsPerAttempt: freeTest.writtenQuestionsPerAttempt ?? 0,
    questionsPerAttempt: freeTest.questionsPerAttempt,
    passMarkPercent: freeTest.passMarkPercent,
  };
}

export const POST = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
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
      await ensureIndexes();

      const freeTest = (await (
        await freeTestsCol()
      ).findOne({
        _id: freeTestId,
        status: "published",
      })) as FreeTest | null;

      if (!freeTest) {
        return fail("Free test not found.", 404);
      }

      const window = checkExamWindow(freeTest);

      if (!window.open) {
        return fail(
          window.reason === "not-yet-open"
            ? `This free test opens on ${window.opensAt?.toLocaleString() ?? "a future date"}.`
            : `This free test closed on ${window.closesAt?.toLocaleString() ?? "a past date"}.`,
          403
        );
      }

      const attempts = await freeTestAttemptsCol();
      const active = await getActiveExam(userId);

      if (active?.kind === "free" && active.examId.equals(freeTestId)) {
        const existingAttempt = await attempts.findOne({
          _id: active.attemptId,
          userId,
          freeTestId,
          activeLock: true,
          status: "in-progress",
        });

        const pendingWrittenPhase =
          existingAttempt?.currentPhase === "preliminary" &&
          (existingAttempt.writtenDurationMinutes ?? 0) > 0 &&
          existingAttempt.answers.some(
            (answer) => answer.sourceCollection === "written_questions"
          );

        if (
          existingAttempt &&
          (existingAttempt.expiresAt.getTime() > Date.now() ||
            pendingWrittenPhase)
        ) {
          const questions = await loadAttemptQuestions(existingAttempt);

          return ok({
            attempt: serializeAttempt(existingAttempt),
            freeTest: serializeFreeTest(freeTest),
            questions: questions.map(serializeQuestion),
          });
        }

        if (existingAttempt) {
          const now = new Date();
          await attempts.updateOne(
            { _id: existingAttempt._id, activeLock: true },
            {
              $set: {
                status: "expired",
                submittedAt: now,
                activeLock: false,
                autoSubmitReason: "time-expired",
                updatedAt: now,
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

      const access = await getFreeTestAccess(userId);

      if (access.locked) {
        return fail("You have used all 10 free attempts.", 403, {
          locked: true,
          used: access.freeAttemptsUsed,
          limit: access.freeAttemptsLimit,
        });
      }

      const refs = freeTest.questions ?? [];
      const resolvedQuestions = (
        await Promise.all(refs.map(resolveQuestion))
      ).filter(
        (question): question is ResolvedAttemptQuestion => question !== null
      );

      const preliminaryPool = resolvedQuestions.filter(
        (question) => question.sourceCollection === "preliminary_questions"
      );
      const writtenPool = resolvedQuestions.filter(
        (question) => question.sourceCollection === "written_questions"
      );

      if (preliminaryPool.length === 0 && writtenPool.length === 0) {
        return fail("This free test has no available questions.", 400);
      }

      const bothPhases = preliminaryPool.length > 0 && writtenPool.length > 0;
      const legacyDuration = freeTest.durationMinutes ?? 0;
      const hasExplicitPhaseDurations =
        typeof freeTest.preliminaryDurationMinutes === "number" ||
        typeof freeTest.writtenDurationMinutes === "number";
      const preliminaryDuration = hasExplicitPhaseDurations
        ? (freeTest.preliminaryDurationMinutes ?? 0)
        : legacyDuration;
      const writtenDuration = hasExplicitPhaseDurations
        ? (freeTest.writtenDurationMinutes ?? 0)
        : legacyDuration;
      const selectedPreliminary =
        preliminaryPool.length > 0
          ? shuffleArray(preliminaryPool).slice(
              0,
              freeTest.questionsPerAttempt > 0
                ? Math.min(freeTest.questionsPerAttempt, preliminaryPool.length)
                : preliminaryPool.length
            )
          : [];
      const selectedWritten =
        writtenPool.length > 0
          ? shuffleArray(writtenPool).slice(
              0,
              (freeTest.writtenQuestionsPerAttempt ?? 0) > 0
                ? Math.min(
                    freeTest.writtenQuestionsPerAttempt ?? 0,
                    writtenPool.length
                  )
                : writtenPool.length
            )
          : [];
      const currentPhase: "preliminary" | "written" | undefined =
        hasExplicitPhaseDurations && bothPhases
          ? "preliminary"
          : selectedPreliminary.length > 0 && selectedWritten.length === 0
            ? "preliminary"
            : selectedPreliminary.length === 0
              ? "written"
              : undefined;
      const phaseDuration = currentPhase
        ? currentPhase === "preliminary"
          ? preliminaryDuration
          : writtenDuration
        : legacyDuration;

      if (
        phaseDuration <= 0 ||
        (hasExplicitPhaseDurations && bothPhases && writtenDuration <= 0)
      ) {
        return fail("This free test has an invalid phase duration.", 400);
      }

      const selected = [...selectedPreliminary, ...selectedWritten];
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + phaseDuration * 60_000);
      const preliminaryEndsAt =
        currentPhase === "preliminary" ? expiresAt : undefined;
      const attempt: FreeTestAttempt = {
        _id: new ObjectId(),
        freeTestId,
        userId,
        startedAt,
        currentPhase,
        phaseStartedAt: startedAt,
        preliminaryDurationMinutes: preliminaryDuration,
        writtenDurationMinutes: writtenDuration,
        passMarkPercent: freeTest.passMarkPercent,
        preliminaryEndsAt,
        expiresAt,
        shuffledOrder: shuffleArray(
          Array.from({ length: selected.length }, (_, index) => index)
        ),
        answers: selected.map((question) => ({
          questionId: question._id,
          sourceCollection: question.sourceCollection,
          marks: question.marks,
          selectedOptionIndex: null,
          answeredAt: null,
          pdfUrl: null,
          pdfPublicId: null,
          uploadedAt: null,
        })),
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: selected.length,
        status: "in-progress",
        activeLock: true,
        createdAt: startedAt,
        updatedAt: startedAt,
      };

      if (process.env.NODE_ENV !== "production") {
        console.log("[free-test/start]", {
          freeTestId: id,
          poolPrelim: preliminaryPool.length,
          poolWritten: writtenPool.length,
          targetPrelim: selectedPreliminary.length,
          targetWritten: selectedWritten.length,
          totalServed: selected.length,
        });
      }

      await attempts.insertOne(attempt);

      return ok({
        attempt: serializeAttempt(attempt),
        freeTest: serializeFreeTest(freeTest),
        questions: selected.map(serializeQuestion),
      });
    } catch (error) {
      console.error("Start free test error", error);
      return fail("Server error", 500);
    }
  }
);
