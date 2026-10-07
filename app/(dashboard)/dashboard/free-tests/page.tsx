import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { FreeTestsStudentClient } from "@/components/dashboard/free-tests-student-client";
import { requireSession } from "@/lib/auth-guard";
import { freeTestAttemptsCol, freeTestsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getActiveExam } from "@/lib/exam-lock";
import { getFreeTestAccess } from "@/lib/free-test-quota";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Model Tests — BJS Prep",
};

export default async function StudentFreeTestsPage() {
  const session = await requireSession();

  if (!session) {
    redirect("/login?next=/dashboard/free-tests");
  }

  await ensureIndexes();

  const [access, active, freeTests, attemptRows] = await Promise.all([
    getFreeTestAccess(new ObjectId(session.userId)),
    getActiveExam(new ObjectId(session.userId)),
    (await freeTestsCol())
      .find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .toArray(),
    (await freeTestAttemptsCol())
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.userId),
            status: { $in: ["submitted", "expired"] },
          },
        },
        {
          $group: {
            _id: "$freeTestId",
            attempts: { $sum: 1 },
            bestScore: { $max: "$score" },
          },
        },
      ])
      .toArray(),
  ]);

  const attemptMap: Record<
    string,
    { attempts: number; bestScore: number | null }
  > = {};

  for (const row of attemptRows) {
    const key = row._id?.toString?.() ?? "";

    if (!key) {
      continue;
    }

    attemptMap[key] = {
      attempts: Number(row.attempts ?? 0),
      bestScore: typeof row.bestScore === "number" ? row.bestScore : null,
    };
  }

  const serializedFreeTests = freeTests.map((test: any) => ({
    id: test._id.toString(),
    title: test.title,
    description: test.description ?? "",
    durationMinutes: Number(
      typeof test.preliminaryDurationMinutes === "number" ||
        typeof test.writtenDurationMinutes === "number"
        ? ((test.questions ?? []).some(
            (reference: { sourceCollection?: string }) =>
              reference.sourceCollection === "preliminary_questions"
          )
            ? (test.preliminaryDurationMinutes ?? 0)
            : 0) +
            ((test.questions ?? []).some(
              (reference: { sourceCollection?: string }) =>
                reference.sourceCollection === "written_questions"
            )
              ? (test.writtenDurationMinutes ?? 0)
              : 0)
        : (test.durationMinutes ?? 0)
    ),
    preliminaryDurationMinutes: Number(
      test.preliminaryDurationMinutes ??
        ((test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "preliminary_questions"
        ) ||
        !(test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "written_questions"
        )
          ? test.durationMinutes
          : 0) ??
        0
    ),
    writtenDurationMinutes: Number(
      test.writtenDurationMinutes ??
        (!(test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "preliminary_questions"
        ) &&
        (test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "written_questions"
        )
          ? test.durationMinutes
          : 0) ??
        0
    ),
    writtenQuestionsPerAttempt: Number(test.writtenQuestionsPerAttempt ?? 0),
    preliminaryQuestionCount: (test.questions ?? []).filter(
      (reference: { sourceCollection?: string }) =>
        reference.sourceCollection === "preliminary_questions"
    ).length,
    writtenQuestionCount: (test.questions ?? []).filter(
      (reference: { sourceCollection?: string }) =>
        reference.sourceCollection === "written_questions"
    ).length,
    usesPhases:
      typeof test.preliminaryDurationMinutes === "number" &&
      typeof test.writtenDurationMinutes === "number" &&
      test.preliminaryDurationMinutes > 0 &&
      test.writtenDurationMinutes > 0 &&
      (test.questions ?? []).some(
        (reference: { sourceCollection?: string }) =>
          reference.sourceCollection === "preliminary_questions"
      ) &&
      (test.questions ?? []).some(
        (reference: { sourceCollection?: string }) =>
          reference.sourceCollection === "written_questions"
      ),
    passMarkPercent: Number(test.passMarkPercent ?? 0),
    questionsPerAttempt: Number(
      (typeof test.preliminaryDurationMinutes === "number" ||
        typeof test.writtenDurationMinutes === "number") &&
        !(test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "preliminary_questions"
        ) &&
        (test.questions ?? []).some(
          (reference: { sourceCollection?: string }) =>
            reference.sourceCollection === "written_questions"
        )
        ? (test.writtenQuestionsPerAttempt ?? test.totalQuestions ?? 0)
        : (test.questionsPerAttempt ?? 0)
    ),
    totalQuestions: Number(test.totalQuestions ?? 0),
    totalMarks: Number(test.totalMarks ?? 0),
  }));

  const serializedActive = active
    ? {
        kind: active.kind,
        examId: active.examId.toString(),
      }
    : null;

  return (
    <FreeTestsStudentClient
      freeTests={serializedFreeTests}
      access={{
        freeAttemptsUsed: Number(access.freeAttemptsUsed ?? 0),
        freeAttemptsLimit: Number(access.freeAttemptsLimit ?? 10),
        freeAttemptsLeft: Number(access.freeAttemptsLeft ?? 0),
        locked: Boolean(access.locked),
      }}
      activeExam={serializedActive}
      attemptMap={attemptMap}
    />
  );
}
