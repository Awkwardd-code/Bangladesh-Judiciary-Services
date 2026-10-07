import { FreeTestsListClient } from "@/components/admin/free-tests-list-client";
import { freeTestsCol } from "@/lib/collections";
import { requireAdmin } from "@/lib/auth-guard";

export default async function FreeTestsPage() {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const tests = await (
    await freeTestsCol()
  )
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const initialFreeTests = tests.map((test) => ({
    _id: test._id.toString(),
    title: test.title,
    description: test.description,
    status: test.status,
    totalQuestions: test.totalQuestions,
    totalMarks: test.totalMarks,
    durationMinutes:
      typeof test.preliminaryDurationMinutes === "number" ||
      typeof test.writtenDurationMinutes === "number"
        ? ((test.questions ?? []).some(
            (reference) =>
              reference.sourceCollection === "preliminary_questions"
          )
            ? (test.preliminaryDurationMinutes ?? 0)
            : 0) +
          ((test.questions ?? []).some(
            (reference) => reference.sourceCollection === "written_questions"
          )
            ? (test.writtenDurationMinutes ?? 0)
            : 0)
        : test.durationMinutes,
    questionsPerAttempt: test.questionsPerAttempt ?? 0,
    preliminaryDurationMinutes:
      test.preliminaryDurationMinutes ??
      ((test.questions ?? []).some(
        (reference) => reference.sourceCollection === "preliminary_questions"
      ) ||
      !(test.questions ?? []).some(
        (reference) => reference.sourceCollection === "written_questions"
      )
        ? test.durationMinutes
        : 0),
    writtenDurationMinutes:
      test.writtenDurationMinutes ??
      (!(test.questions ?? []).some(
        (reference) => reference.sourceCollection === "preliminary_questions"
      ) &&
      (test.questions ?? []).some(
        (reference) => reference.sourceCollection === "written_questions"
      )
        ? test.durationMinutes
        : 0),
    writtenQuestionsPerAttempt: test.writtenQuestionsPerAttempt ?? 0,
    usesPhases:
      typeof test.preliminaryDurationMinutes === "number" &&
      typeof test.writtenDurationMinutes === "number" &&
      test.preliminaryDurationMinutes > 0 &&
      test.writtenDurationMinutes > 0 &&
      (test.questions ?? []).some(
        (reference) => reference.sourceCollection === "preliminary_questions"
      ) &&
      (test.questions ?? []).some(
        (reference) => reference.sourceCollection === "written_questions"
      ),
    createdAt: test.createdAt
      ? new Date(test.createdAt).toISOString()
      : undefined,
  }));

  return <FreeTestsListClient initialFreeTests={initialFreeTests} />;
}
