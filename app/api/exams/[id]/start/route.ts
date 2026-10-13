import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import {
  coursesCol,
  examAttemptsCol,
  examQuestionsCol,
  examsCol,
} from "@/lib/collections";
import { checkExamAccess, examAccessError } from "@/lib/exam-access";
import { checkExamWindow } from "@/lib/exam-window";
import { consumeFreeAttempt } from "@/lib/exam-quota";
import { getActiveExam, shuffleArray } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";
import type { Exam, ExamAttempt, ExamQuestion } from "@/lib/types/exam";

function serializeAttempt(attempt: ExamAttempt, kind: Exam["kind"]) {
  return {
    id: attempt._id.toString(),
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    shuffledOrder: attempt.shuffledOrder,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId.toString(),
      selectedOptionIndex: answer.selectedOptionIndex,
      answeredAt: answer.answeredAt?.toISOString() ?? null,
      pdfUrl: answer.pdfUrl ?? null,
      pdfPublicId: answer.pdfPublicId ?? null,
    })),
    perQuestionAnswers:
      kind === "written"
        ? attempt.answers.map((answer) => ({
            questionId: answer.questionId.toString(),
            pdfUrl: answer.pdfUrl ?? null,
            pdfPublicId: answer.pdfPublicId ?? null,
            uploadedAt: answer.answeredAt?.toISOString() ?? null,
          }))
        : undefined,
  };
}

function serializeExam(exam: Exam) {
  return {
    id: exam._id.toString(),
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestions,
    totalMarks: exam.totalMarks,
    questionsPerAttempt: exam.questionsPerAttempt,
    negativeMarking: exam.negativeMarking,
    passMarkPercent: exam.passMarkPercent,
  };
}

function serializeQuestion(question: ExamQuestion, position: number) {
  return {
    id: question._id.toString(),
    position,
    source: "exam_questions" as const,
    questionText: question.questionText,
    options: question.options,
    marks: question.marks,
    maxMarks: question.maxMarks,
    subject: question.subject ?? "General",
  };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    if (!session) {
      return fail("Not authenticated.", 401);
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Exam not found.", 404);
    }

    await ensureIndexes();
    const examId = new ObjectId(id);
    const userId = new ObjectId(session.userId);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam || exam.status !== "published") {
      return fail("This exam is not available.", 404);
    }

    const window = checkExamWindow(exam);
    if (!window.open) {
      return fail("This exam is outside its availability window.", 403);
    }

    const course = await (await coursesCol()).findOne({ _id: exam.courseId });
    if (!course) {
      return fail("The course for this exam could not be found.", 404);
    }

    const access = await checkExamAccess(userId, exam, course);
    if (!access.allowed) {
      const error = examAccessError(access);
      return fail(error.message, error.status, error.extra);
    }

    const active = await getActiveExam(userId);
    if (active?.examId.equals(examId) && active.unified) {
      const existing = await (await examAttemptsCol()).findOne({
        _id: active.attemptId,
        examId,
        userId,
        activeLock: true,
        status: "in-progress",
      });

      if (existing && existing.expiresAt.getTime() > Date.now()) {
        const selected = existing.answers.map((answer) =>
          answer.questionId.toString(),
        );
        const questions = await (await examQuestionsCol())
          .find({
            examId,
            _id: { $in: selected.map((questionId) => new ObjectId(questionId)) },
          })
          .toArray();
        const questionById = new Map(
          questions.map((question) => [question._id.toString(), question]),
        );
        const runnerQuestions = existing.answers.flatMap((answer, position) => {
          const question = questionById.get(answer.questionId.toString());
          return question ? [serializeQuestion(question, position)] : [];
        });
        const attempt = serializeAttempt(existing, exam.kind);

        return ok({
          exam: serializeExam(exam),
          questions: runnerQuestions,
          ...(exam.kind === "written" ? { submission: attempt } : { attempt }),
        });
      }

      if (existing) {
        await (await examAttemptsCol()).updateOne(
          { _id: existing._id, activeLock: true },
          {
            $set: {
              status: "expired",
              submittedAt: new Date(),
              activeLock: false,
              autoSubmitReason: "time-expired",
              updatedAt: new Date(),
            },
          },
        );
      }
    } else if (active) {
      return fail("You already have an exam in progress.", 409, {
        activeExamId: active.examId.toString(),
        activeExamKind: active.kind,
      });
    }

    const questionCollection = await examQuestionsCol();
    const allQuestions = await questionCollection
      .find({ examId })
      .sort({ order: 1 })
      .toArray();
    if (allQuestions.length === 0) {
      return fail("This exam has no questions.", 400);
    }

    const requestedCount = exam.questionsPerAttempt;
    const targetCount =
      requestedCount > 0
        ? Math.min(requestedCount, allQuestions.length)
        : allQuestions.length;
    const selectedQuestions =
      targetCount < allQuestions.length
        ? shuffleArray(allQuestions).slice(0, targetCount)
        : allQuestions;
    const startedAt = new Date();
    const attemptId = new ObjectId();
    const attempt: ExamAttempt = {
      _id: attemptId,
      examId,
      userId,
      segmentId: exam.segmentId,
      subSegmentId: exam.subSegmentId,
      levelId: exam._id,
      levelKind: exam.kind === "written" ? "written" : "mcq",
      startedAt,
      expiresAt: new Date(startedAt.getTime() + exam.durationMinutes * 60_000),
      answers: selectedQuestions.map((question) => ({
        questionId: question._id,
        selectedOptionIndex: null,
        answeredAt: null,
        pdfUrl: null,
        pdfPublicId: null,
      })),
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: selectedQuestions.length,
      status: "in-progress",
      activeLock: true,
      shuffledOrder: shuffleArray(
        Array.from({ length: selectedQuestions.length }, (_, index) => index),
      ),
      consumedFreeAttempt: false,
      passMarkPercent: exam.passMarkPercent,
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    await (await examAttemptsCol()).insertOne(attempt);

    if (access.willConsumeFreeAttempt) {
      const quota = await consumeFreeAttempt(userId, examId, attemptId);
      if (!quota.ok) {
        await (await examAttemptsCol()).deleteOne({ _id: attemptId });
        return fail("You have used all free exam attempts.", 403);
      }

      attempt.consumedFreeAttempt = true;
      await (await examAttemptsCol()).updateOne(
        { _id: attemptId },
        { $set: { consumedFreeAttempt: true, updatedAt: new Date() } },
      );
    }

    const serializedAttempt = serializeAttempt(attempt, exam.kind);
    const data = {
      exam: serializeExam(exam),
      questions: selectedQuestions.map(serializeQuestion),
    };

    return ok({
      ...data,
      ...(exam.kind === "written"
        ? { submission: serializedAttempt }
        : { attempt: serializedAttempt }),
    });
  } catch (error) {
    console.error("Start unified exam error", error);
    return fail("Server error", 500);
  }
}
