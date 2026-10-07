import "server-only";

import { ObjectId } from "mongodb";

import { freeTestAttemptsCol } from "@/lib/collections";
import type { FreeTestAccess } from "@/lib/types/free-test";

export const FREE_TEST_LIMIT = 10;

export async function getFreeTestAccess(
  userId: ObjectId,
): Promise<FreeTestAccess> {
  const attempts = await (await freeTestAttemptsCol())
    .find({
      userId,
      status: { $in: ["submitted", "expired"] },
    })
    .toArray();

  const used = attempts.length;
  const left = Math.max(0, FREE_TEST_LIMIT - used);

  return {
    hasFreeAttempt: used < FREE_TEST_LIMIT,
    freeAttemptsUsed: used,
    freeAttemptsLimit: FREE_TEST_LIMIT,
    freeAttemptsLeft: left,
    locked: used >= FREE_TEST_LIMIT,
  };
}
