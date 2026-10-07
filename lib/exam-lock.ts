import { ObjectId } from "mongodb";

import {
  freeTestAttemptsCol,
  preliminaryAttemptsCol,
  writtenSubmissionsCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import type { ActiveExam } from "@/lib/types/exam";

export async function getActiveExam(
  userId: ObjectId,
): Promise<ActiveExam> {
  await ensureIndexes();

  const preliminary = await (await preliminaryAttemptsCol()).findOne({
    userId,
    activeLock: true,
  });

  if (preliminary) {
    return {
      kind: "preliminary",
      attemptId: preliminary._id,
      examId: preliminary.examId,
    };
  }

  const written = await (await writtenSubmissionsCol()).findOne({
    userId,
    activeLock: true,
  });

  if (written) {
    return {
      kind: "written",
      submissionId: written._id,
      examId: written.examId,
    };
  }

  const freeAttempt = await (await freeTestAttemptsCol()).findOne({
    userId,
    activeLock: true,
  });

  if (freeAttempt) {
    return {
      kind: "free",
      attemptId: freeAttempt._id,
      examId: freeAttempt.freeTestId,
    };
  }

  return null;
}

export async function releaseExamLock(
  kind: "preliminary" | "written" | "free",
  id: ObjectId,
): Promise<void> {
  await ensureIndexes();

  const collection =
    kind === "preliminary"
      ? await preliminaryAttemptsCol()
      : kind === "written"
        ? await writtenSubmissionsCol()
        : await freeTestAttemptsCol();

  await collection.updateOne(
    { _id: id },
    { $set: { activeLock: false, updatedAt: new Date() } },
  );
}

export function shuffleArray<T>(arr: T[]): T[] {
  const next = [...arr];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
