import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryAttemptsCol,
  preliminaryExamsCol,
  preliminaryQuestionsCol,
  usersCol,
  writtenExamsCol,
  writtenQuestionsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

const kindSchema = z.enum(["preliminary", "written", "free"]);

type ReviewQuestion = {
  position: number;
  questionId: string;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  selectedOptionIndex?: number | null;
  isCorrect?: boolean;
  skipped?: boolean;
  marks: number;
  subject?: string;
  explanation?: string;
  pdfUrl?: string | null;
  awardedMarks?: number;
  comment?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const { attemptId } = await params;

    if (!ObjectId.isValid(attemptId)) {
      return fail("Invalid attempt ID.", 400);
    }

    const parsedKind = kindSchema.safeParse(
      new URL(request.url).searchParams.get("kind")
    );

    if (!parsedKind.success) {
      return fail("Invalid exam kind.", 400);
    }

    await ensureIndexes();

    const id = new ObjectId(attemptId);
    const kind = parsedKind.data;

    if (kind === "preliminary") {
      const attempt = await (
        await preliminaryAttemptsCol()
      ).findOne({
        _id: id,
        status: { $in: ["submitted", "auto-submitted", "expired"] },
      });

      if (!attempt) {
        return fail("Attempt not found.", 404);
      }

      const [user, exam, sourceQuestions] = await Promise.all([
        (await usersCol()).findOne({ _id: attempt.userId }),
        (await preliminaryExamsCol()).findOne({ _id: attempt.examId }),
        (await preliminaryQuestionsCol())
          .find({
            _id: { $in: attempt.answers.map((answer) => answer.questionId) },
            examId: attempt.examId,
          })
          .toArray(),
      ]);
      const questionById = new Map(
        sourceQuestions.map((question) => [question._id.toString(), question])
      );
      const questions: ReviewQuestion[] = attempt.answers.flatMap(
        (answer, position) => {
          const question = questionById.get(answer.questionId.toString());

          if (!question) {
            return [];
          }

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
              subject: question.subject,
              explanation: question.explanation,
            },
          ];
        }
      );

      return ok({
        attempt: {
          id: attempt._id.toString(),
          score: attempt.score,
          totalMarks: questions.reduce(
            (sum, question) => sum + question.marks,
            0
          ),
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          skippedCount: attempt.skippedCount,
          status: attempt.status,
          submittedAt: attempt.submittedAt?.toISOString() ?? null,
          passMarkPercent: null,
        },
        user: user
          ? { id: user._id.toString(), name: user.name, email: user.email }
          : null,
        exam: exam ? { id: exam._id.toString(), title: exam.title } : null,
        questions,
      });
    }

    if (kind === "written") {
      const submission = await (
        await writtenSubmissionsCol()
      ).findOne({
        _id: id,
        status: { $in: ["submitted", "under-review", "graded"] },
      });

      if (!submission) {
        return fail("Submission not found.", 404);
      }

      const submissionAnswers = submission.perQuestionAnswers ?? [];
      const submissionScores = submission.perQuestionScores ?? [];
      const [user, exam, sourceQuestions] = await Promise.all([
        (await usersCol()).findOne({ _id: submission.userId }),
        (await writtenExamsCol()).findOne({ _id: submission.examId }),
        (await writtenQuestionsCol())
          .find({
            _id: {
              $in: [
                ...(submission.selectedQuestionIds ?? []),
                ...submissionAnswers.map((answer) => answer.questionId),
              ],
            },
            examId: submission.examId,
          })
          .toArray(),
      ]);
      const questionById = new Map(
        sourceQuestions.map((question) => [question._id.toString(), question])
      );
      const answerById = new Map(
        submissionAnswers.map((answer) => [
          answer.questionId.toString(),
          answer,
        ])
      );
      const scoreById = new Map(
        submissionScores.map((score) => [score.questionId.toString(), score])
      );
      const questionIds = [
        ...new Set([
          ...(submission.selectedQuestionIds ?? []).map((questionId) =>
            questionId.toString()
          ),
          ...submissionAnswers.map((answer) => answer.questionId.toString()),
        ]),
      ];
      const questions: ReviewQuestion[] = questionIds.flatMap(
        (questionId, position) => {
          const question = questionById.get(questionId);

          if (!question) {
            return [];
          }

          const answer = answerById.get(questionId);
          const score = scoreById.get(questionId);

          return [
            {
              position,
              questionId,
              questionText: question.questionText,
              marks: question.maxMarks,
              subject: question.subject,
              pdfUrl: answer?.pdfUrl ?? null,
              awardedMarks:
                submission.status === "graded"
                  ? score?.awardedMarks
                  : undefined,
              comment:
                submission.status === "graded" ? score?.comment : undefined,
            },
          ];
        }
      );

      return ok({
        attempt: {
          id: submission._id.toString(),
          score: submission.totalScore,
          totalMarks: submission.maxScore || exam?.totalMarks || 0,
          correctCount: 0,
          wrongCount: 0,
          skippedCount: 0,
          status: submission.status,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
          passMarkPercent: null,
        },
        user: user
          ? { id: user._id.toString(), name: user.name, email: user.email }
          : null,
        exam: exam ? { id: exam._id.toString(), title: exam.title } : null,
        questions,
      });
    }

    const attempt = await (await freeTestAttemptsCol()).findOne({ _id: id });

    if (
      !attempt ||
      !["submitted", "auto-submitted", "expired", "graded"].includes(
        attempt.status
      )
    ) {
      return fail("Attempt not found.", 404);
    }

    const [user, exam] = await Promise.all([
      (await usersCol()).findOne({ _id: attempt.userId }),
      (await freeTestsCol()).findOne({ _id: attempt.freeTestId }),
    ]);

    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const legacyReferences = exam.questions ?? [];
    const questionEntries = attempt.answers.map((answer, position) => {
      const reference = legacyReferences.find((item) =>
        item.questionId.equals(answer.questionId)
      );
      return {
        answer,
        position,
        reference,
        sourceCollection:
          answer.sourceCollection ??
          reference?.sourceCollection ??
          "preliminary_questions",
      };
    });
    const preliminaryQuestionIds = questionEntries
      .filter((entry) => entry.sourceCollection === "preliminary_questions")
      .map((entry) => entry.answer.questionId);
    const writtenQuestionIds = questionEntries
      .filter((entry) => entry.sourceCollection === "written_questions")
      .map((entry) => entry.answer.questionId);
    const [preliminaryQuestions, writtenQuestions] = await Promise.all([
      preliminaryQuestionIds.length
        ? (await preliminaryQuestionsCol())
            .find({ _id: { $in: preliminaryQuestionIds } })
            .toArray()
        : [],
      writtenQuestionIds.length
        ? (await writtenQuestionsCol())
            .find({ _id: { $in: writtenQuestionIds } })
            .toArray()
        : [],
    ]);
    const questionByKey = new Map<
      string,
      (typeof preliminaryQuestions)[number] | (typeof writtenQuestions)[number]
    >();
    preliminaryQuestions.forEach((question) => {
      questionByKey.set(
        `preliminary_questions:${question._id.toString()}`,
        question
      );
    });
    writtenQuestions.forEach((question) => {
      questionByKey.set(
        `written_questions:${question._id.toString()}`,
        question
      );
    });
    const questions: ReviewQuestion[] = questionEntries.flatMap(
      ({ answer, position, reference, sourceCollection }): ReviewQuestion[] => {
        const question = questionByKey.get(
          `${sourceCollection}:${answer.questionId.toString()}`
        );

        if (!question) {
          return [];
        }

        if ("correctOptionIndex" in question) {
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
              marks: answer.marks ?? reference?.marks ?? question.marks,
              subject: question.subject,
              explanation: question.explanation,
            },
          ];
        }

        return [
          {
            position,
            questionId: question._id.toString(),
            questionText: question.questionText,
            marks: answer.marks ?? reference?.marks ?? question.maxMarks,
            subject: question.subject,
            pdfUrl: answer.pdfUrl ?? null,
          },
        ];
      }
    );
    const passMarkPercent =
      attempt.passMarkPercent ?? exam.passMarkPercent ?? null;

    return ok({
      attempt: {
        id: attempt._id.toString(),
        score: attempt.score,
        totalMarks: questions.reduce(
          (sum, question) => sum + question.marks,
          0
        ),
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        status: attempt.status,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        passMarkPercent,
      },
      user: user
        ? { id: user._id.toString(), name: user.name, email: user.email }
        : null,
      exam: { id: exam._id.toString(), title: exam.title },
      questions,
    });
  } catch (error) {
    console.error("Get leaderboard attempt detail error", error);
    return fail("Server error", 500);
  }
}
