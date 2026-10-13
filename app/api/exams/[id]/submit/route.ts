import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { examAttemptsCol, examQuestionsCol, examsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

const submitSchema = z.object({
  attemptId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  submissionId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  reason: z.enum(["manual", "tab-change", "visibility-hidden", "time-expired"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const parsed = submitSchema.safeParse(await request.json());
    if (
      !parsed.success ||
      (!parsed.data.attemptId && !parsed.data.submissionId)
    ) {
      return fail("Invalid exam submission.", 400);
    }

    await ensureIndexes();
    const examId = new ObjectId(id);
    const attemptId = new ObjectId(
      parsed.data.attemptId ?? parsed.data.submissionId!
    );
    const userId = new ObjectId(session.userId);
    const exam = await (await examsCol()).findOne({ _id: examId });
    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const attempts = await examAttemptsCol();
    const attempt = await attempts.findOne({
      _id: attemptId,
      examId,
      userId,
    });
    if (!attempt) {
      return fail("Exam attempt not found.", 404);
    }
    if (!attempt.activeLock || attempt.status !== "in-progress") {
      if (
        attempt.status === "submitted" ||
        attempt.status === "auto-submitted" ||
        attempt.status === "graded"
      ) {
        return ok({
          ...(exam.kind === "written"
            ? {
                submission: {
                  id: attemptId.toString(),
                  totalScore: attempt.score,
                  maxScore: exam.totalMarks,
                  submittedAt: attempt.submittedAt?.toISOString() ?? null,
                  status: attempt.status,
                },
              }
            : {
                attempt: {
                  id: attemptId.toString(),
                  score: attempt.score,
                  correctCount: attempt.correctCount,
                  wrongCount: attempt.wrongCount,
                  skippedCount: attempt.skippedCount,
                  submittedAt: attempt.submittedAt?.toISOString() ?? null,
                  autoSubmitReason:
                    attempt.autoSubmitReason ?? parsed.data.reason,
                  status: attempt.status,
                },
              }),
        });
      }

      return fail("This exam attempt is no longer active.", 409);
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    if (exam.kind === "preliminary") {
      const questionIds = attempt.answers.map((answer) => answer.questionId);
      const questions = await (
        await examQuestionsCol()
      )
        .find({ examId, _id: { $in: questionIds } })
        .toArray();
      const questionById = new Map(
        questions.map((question) => [question._id.toString(), question])
      );

      for (const answer of attempt.answers) {
        const question = questionById.get(answer.questionId.toString());
        if (!question) {
          continue;
        }
        if (answer.selectedOptionIndex === null) {
          skippedCount += 1;
        } else if (answer.selectedOptionIndex === question.correctOptionIndex) {
          score += question.marks;
          correctCount += 1;
        } else {
          score = score - (exam.negativeMarking ?? 0);
          wrongCount += 1;
        }
      }
      score = Math.max(0, score);
    } else {
      skippedCount = attempt.answers.filter((answer) => !answer.pdfUrl).length;
    }

    const submittedAt = new Date();
    const status =
      parsed.data.reason === "time-expired" ? "auto-submitted" : "submitted";
    const update = await attempts.updateOne(
      {
        _id: attemptId,
        examId,
        userId,
        activeLock: true,
        status: "in-progress",
      },
      {
        $set: {
          score,
          correctCount,
          wrongCount,
          skippedCount,
          submittedAt,
          autoSubmitReason: parsed.data.reason,
          status,
          activeLock: false,
          updatedAt: submittedAt,
        },
      }
    );
    if (update.modifiedCount !== 1) {
      return fail("This attempt has already been submitted.", 409);
    }

    return ok({
      ...(exam.kind === "written"
        ? {
            submission: {
              id: attemptId.toString(),
              totalScore: score,
              maxScore: exam.totalMarks,
              submittedAt: submittedAt.toISOString(),
              status,
            },
          }
        : {
            attempt: {
              id: attemptId.toString(),
              score,
              correctCount,
              wrongCount,
              skippedCount,
              submittedAt: submittedAt.toISOString(),
              autoSubmitReason: parsed.data.reason,
              status,
            },
          }),
    });
  } catch (error) {
    console.error("Submit unified exam error", error);
    return fail("Server error", 500);
  }
}
