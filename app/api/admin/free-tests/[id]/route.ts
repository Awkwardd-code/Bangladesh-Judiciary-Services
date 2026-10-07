import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  freeTestAttemptsCol,
  freeTestsCol,
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { freeTestUpdateSchema } from "@/lib/validators/free-test";

async function resolveFreeTestQuestions(freeTest: any) {
  const refs = Array.isArray(freeTest?.questions) ? freeTest.questions : [];

  if (refs.length === 0) {
    return [];
  }

  const preliminaryIds = refs
    .filter(
      (ref: any) =>
        String(ref?.sourceCollection ?? "") === "preliminary_questions"
    )
    .map((ref: any) => new ObjectId(String(ref.questionId)));

  const writtenIds = refs
    .filter(
      (ref: any) => String(ref?.sourceCollection ?? "") === "written_questions"
    )
    .map((ref: any) => new ObjectId(String(ref.questionId)));

  const [preliminary, written] = await Promise.all([
    preliminaryIds.length > 0
      ? (await preliminaryQuestionsCol())
          .find({ _id: { $in: preliminaryIds } })
          .toArray()
      : [],
    writtenIds.length > 0
      ? (await writtenQuestionsCol())
          .find({ _id: { $in: writtenIds } })
          .toArray()
      : [],
  ]);

  const bank = new Map<string, any>();

  for (const question of preliminary) {
    bank.set(question._id.toString(), {
      ...question,
      sourceCollection: "preliminary_questions",
    });
  }

  for (const question of written) {
    bank.set(question._id.toString(), {
      ...question,
      sourceCollection: "written_questions",
    });
  }

  return refs
    .map((ref: any) => {
      const questionId = String(ref?.questionId ?? "");
      const question = bank.get(questionId);

      if (!question) {
        return null;
      }

      const sourceCollection = String(
        ref?.sourceCollection ?? question.sourceCollection
      ) as "preliminary_questions" | "written_questions";

      return {
        id: question._id.toString(),
        sourceCollection,
        questionText: String(question.questionText ?? ""),
        options: Array.isArray(question.options)
          ? question.options.map((item: unknown) => String(item))
          : undefined,
        maxMarks:
          typeof question.maxMarks === "number" ? question.maxMarks : undefined,
        marks: Number(ref?.marks ?? question.marks ?? question.maxMarks ?? 0),
        subject: String(question.subject ?? "General"),
      };
    })
    .filter(Boolean);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const { id } = await params;
    const freeTest = await (
      await freeTestsCol()
    ).findOne({
      _id: new ObjectId(id),
    });

    if (!freeTest) {
      return fail("Free test not found", 404);
    }

    return ok({
      freeTest,
      questions: await resolveFreeTestQuestions(freeTest),
    });
  } catch (error) {
    console.error("Fetch free test error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const { id } = await params;
    const body = await req.json();
    const parsed = freeTestUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid update", 400);
    }

    const freeTest = await (
      await freeTestsCol()
    ).findOne({
      _id: new ObjectId(id),
    });

    if (!freeTest) {
      return fail("Free test not found", 404);
    }

    const requestedQuestionsPerAttempt = parsed.data.questionsPerAttempt;
    const requestedWrittenQuestionsPerAttempt =
      parsed.data.writtenQuestionsPerAttempt;
    const currentPreliminaryQuestions = (freeTest.questions ?? []).filter(
      (reference) =>
        reference.sourceCollection === "preliminary_questions"
    ).length;
    const currentWrittenQuestions = (freeTest.questions ?? []).filter(
      (reference) => reference.sourceCollection === "written_questions"
    ).length;

    if (
      requestedQuestionsPerAttempt !== undefined &&
      requestedQuestionsPerAttempt > 0 &&
      requestedQuestionsPerAttempt > currentPreliminaryQuestions
    ) {
      return fail(
        `Questions per attempt (${requestedQuestionsPerAttempt}) cannot exceed the preliminary pool (${currentPreliminaryQuestions}).`,
        400
      );
    }

    if (
      requestedWrittenQuestionsPerAttempt !== undefined &&
      requestedWrittenQuestionsPerAttempt > 0 &&
      currentWrittenQuestions > 0 &&
      requestedWrittenQuestionsPerAttempt > currentWrittenQuestions
    ) {
      return fail(
        `Written questions per attempt (${requestedWrittenQuestionsPerAttempt}) cannot exceed total written questions (${currentWrittenQuestions}).`,
        400
      );
    }

    const nextStatus = parsed.data.status ?? freeTest.status;
    const nextQuestionsPerAttempt =
      parsed.data.questionsPerAttempt ?? freeTest.questionsPerAttempt ?? 0;

    if (nextStatus === "published") {
      const refs = freeTest.questions ?? [];
      const hasExplicitPhaseDurations =
        parsed.data.preliminaryDurationMinutes !== undefined ||
        parsed.data.writtenDurationMinutes !== undefined ||
        typeof freeTest.preliminaryDurationMinutes === "number" ||
        typeof freeTest.writtenDurationMinutes === "number";
      const preliminaryCount = refs.filter(
        (ref) => ref.sourceCollection === "preliminary_questions"
      ).length;
      const writtenCount = refs.filter(
        (ref) => ref.sourceCollection === "written_questions"
      ).length;

      if (!hasExplicitPhaseDurations) {
        const requiredCount =
          nextQuestionsPerAttempt > 0
            ? nextQuestionsPerAttempt
            : refs.length > 0
              ? refs.length
              : 1;

        if (refs.length < requiredCount) {
          return fail(
            `Select at least ${requiredCount} questions before publishing.`,
            400
          );
        }
      } else {
        const preliminaryDuration =
          parsed.data.preliminaryDurationMinutes ??
          freeTest.preliminaryDurationMinutes ??
          freeTest.durationMinutes ??
          0;
        const writtenDuration =
          parsed.data.writtenDurationMinutes ??
          freeTest.writtenDurationMinutes ??
          0;
        const usesPreliminary = preliminaryCount > 0;
        const usesWritten = writtenCount > 0;
        const preliminaryDurationConfigured =
          parsed.data.preliminaryDurationMinutes ??
          freeTest.preliminaryDurationMinutes;
        const writtenDurationConfigured =
          parsed.data.writtenDurationMinutes ??
          freeTest.writtenDurationMinutes;

        if (!usesPreliminary && !usesWritten) {
          return fail("Select at least one question before publishing.", 400);
        }

        if (preliminaryDurationConfigured && !usesPreliminary) {
          return fail(
            "Select at least one preliminary question for its configured duration.",
            400
          );
        }

        if (writtenDurationConfigured && !usesWritten) {
          return fail(
            "Select at least one written question for its configured duration.",
            400
          );
        }

        if (usesPreliminary && preliminaryDuration <= 0) {
          return fail("Set a preliminary duration before publishing.", 400);
        }

        const preliminaryTarget =
          nextQuestionsPerAttempt > 0
            ? nextQuestionsPerAttempt
            : preliminaryCount;

        if (usesPreliminary && preliminaryCount < preliminaryTarget) {
          return fail(
            `Select at least ${preliminaryTarget} preliminary questions before publishing.`,
            400
          );
        }

        const writtenTarget =
          parsed.data.writtenQuestionsPerAttempt ??
          freeTest.writtenQuestionsPerAttempt ??
          0;

        if (usesWritten && writtenDuration <= 0) {
          return fail("Set a written duration before publishing.", 400);
        }

        const effectiveWrittenTarget =
          writtenTarget > 0 ? writtenTarget : writtenCount;

        if (usesWritten && writtenCount < effectiveWrittenTarget) {
          return fail(
            `Select at least ${effectiveWrittenTarget} written questions before publishing.`,
            400
          );
        }
      }
    }

    const update: Record<string, any> = {
      updatedAt: new Date(),
    };

    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) {
        continue;
      }

      if (key === "scheduledAt") {
        update.scheduledAt = value ? new Date(value as string) : null;
        continue;
      }

      if (key === "closesAt") {
        update.closesAt = value ? new Date(value as string) : null;
        continue;
      }

      update[key] = value;
    }

    if (
      parsed.data.preliminaryDurationMinutes !== undefined ||
      parsed.data.writtenDurationMinutes !== undefined
    ) {
      const preliminaryDuration =
        parsed.data.preliminaryDurationMinutes ??
        freeTest.preliminaryDurationMinutes ??
        freeTest.durationMinutes ??
        0;
      const writtenDuration =
        parsed.data.writtenDurationMinutes ??
        freeTest.writtenDurationMinutes ??
        0;

      update.durationMinutes = preliminaryDuration + writtenDuration;
    }

    await (
      await freeTestsCol()
    ).updateOne({ _id: new ObjectId(id) }, { $set: update });

    const updated = await (
      await freeTestsCol()
    ).findOne({
      _id: new ObjectId(id),
    });

    return ok({ freeTest: updated });
  } catch (error) {
    console.error("Update free test error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const { id } = await params;
    const freeTestId = new ObjectId(id);

    await (await freeTestsCol()).deleteOne({ _id: freeTestId });
    await (await freeTestAttemptsCol()).deleteMany({ freeTestId });

    return ok({ message: "Free test deleted." });
  } catch (error) {
    console.error("Delete free test error", error);
    return fail("Server error", 500);
  }
}
