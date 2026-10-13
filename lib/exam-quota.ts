import "server-only";

import { ObjectId } from "mongodb";

import { examAttemptsCol, preliminaryAttemptsCol, usersCol, writtenSubmissionsCol } from "@/lib/collections";

export const DEFAULT_FREE_EXAM_LIMIT = 10;

export type QuotaStatus = {
  used: number;
  limit: number;
  remaining: number;
  isExhausted: boolean;
};

function normalizeLimit(value: number | undefined) {
  const next = Number(value ?? DEFAULT_FREE_EXAM_LIMIT);
  return Number.isFinite(next) && next > 0 ? next : DEFAULT_FREE_EXAM_LIMIT;
}

function buildQuotaStatus(used: number, limit: number): QuotaStatus {
  const safeUsed = Math.max(0, Number(used) || 0);
  const safeLimit = normalizeLimit(limit);
  const remaining = Math.max(0, safeLimit - safeUsed);

  return {
    used: safeUsed,
    limit: safeLimit,
    remaining,
    isExhausted: remaining === 0,
  };
}

export async function getFreeAttemptStatus(
  userId: ObjectId,
): Promise<QuotaStatus> {
  const user = await (await usersCol()).findOne({ _id: userId });

  if (!user) {
    return buildQuotaStatus(0, DEFAULT_FREE_EXAM_LIMIT);
  }

  return buildQuotaStatus(
    Number(user.freeExamsUsed ?? 0),
    Number(user.freeExamsLimit ?? DEFAULT_FREE_EXAM_LIMIT),
  );
}

export async function consumeFreeAttempt(
  userId: ObjectId,
  _examId: ObjectId,
  _attemptId: ObjectId,
): Promise<{ ok: boolean; status: QuotaStatus }> {
  const user = await (await usersCol()).findOne({ _id: userId });

  if (!user) {
    return { ok: false, status: buildQuotaStatus(0, DEFAULT_FREE_EXAM_LIMIT) };
  }

  const status = buildQuotaStatus(
    Number(user.freeExamsUsed ?? 0),
    Number(user.freeExamsLimit ?? DEFAULT_FREE_EXAM_LIMIT),
  );

  if (status.remaining <= 0) {
    return { ok: false, status };
  }

  const nextUsed = Math.min(status.limit, status.used + 1);

  await (await usersCol()).updateOne(
    { _id: userId },
    { $set: { freeExamsUsed: nextUsed, updatedAt: new Date() } },
  );

  const updatedStatus = buildQuotaStatus(nextUsed, status.limit);

  return { ok: true, status: updatedStatus };
}

export async function refundFreeAttempt(
  userId: ObjectId,
  attemptId: ObjectId,
): Promise<{ ok: boolean; status: QuotaStatus }> {
  const status = await getFreeAttemptStatus(userId);

  if (status.used <= 0) {
    return { ok: false, status };
  }

  const collections = [
    await examAttemptsCol(),
    await preliminaryAttemptsCol(),
    await writtenSubmissionsCol(),
  ];

  type FreeAttemptRecord = {
    _id: ObjectId;
    userId: ObjectId;
    status?: string;
    consumedFreeAttempt?: boolean;
    updatedAt?: Date;
    activeLock?: boolean;
  };

  let attempt: FreeAttemptRecord | null = null;

  for (const collection of collections) {
    const found = (await collection.findOne({
      _id: attemptId,
      userId,
      activeLock: true,
    })) as FreeAttemptRecord | null;

    if (found) {
      attempt = found;
      break;
    }
  }

  if (!attempt || attempt.consumedFreeAttempt !== true) {
    return { ok: false, status };
  }

  if (
    attempt.status !== "in-progress" &&
    attempt.status !== "expired"
  ) {
    return { ok: false, status };
  }

  const nextUsed = Math.max(0, status.used - 1);

  await (await usersCol()).updateOne(
    { _id: userId },
    { $set: { freeExamsUsed: nextUsed, updatedAt: new Date() } },
  );

  for (const collection of collections) {
    const updated = await collection.updateOne(
      { _id: attemptId, userId, activeLock: true },
      { $set: { consumedFreeAttempt: false, updatedAt: new Date() } },
    );

    if (updated.matchedCount > 0) {
      break;
    }
  }

  return { ok: true, status: buildQuotaStatus(nextUsed, status.limit) };
}

export async function resetFreeAttempts(
  userId: ObjectId,
): Promise<QuotaStatus> {
  const user = await (await usersCol()).findOne({ _id: userId });
  const baseLimit = normalizeLimit(user?.freeExamsLimit ?? DEFAULT_FREE_EXAM_LIMIT);

  await (await usersCol()).updateOne(
    { _id: userId },
    { $set: { freeExamsUsed: 0, updatedAt: new Date() } },
  );

  return buildQuotaStatus(0, baseLimit);
}

export async function adjustFreeAttempts(
  userId: ObjectId,
  delta: number,
): Promise<QuotaStatus> {
  const user = await (await usersCol()).findOne({ _id: userId });
  const limit = normalizeLimit(user?.freeExamsLimit ?? DEFAULT_FREE_EXAM_LIMIT);
  const used = Math.max(0, Number(user?.freeExamsUsed ?? 0));
  const nextUsed = Math.min(limit, Math.max(0, used + Number(delta ?? 0)));

  await (await usersCol()).updateOne(
    { _id: userId },
    { $set: { freeExamsUsed: nextUsed, updatedAt: new Date() } },
  );

  return buildQuotaStatus(nextUsed, limit);
}
