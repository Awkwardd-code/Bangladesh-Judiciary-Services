import "server-only";

import { ObjectId } from "mongodb";

import { authAuditCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import type { AuthAuditAction } from "@/lib/types/auth-audit";

type AuthAuditOptions = {
  userId?: ObjectId;
  email?: string;
  ip: string;
  userAgent: string;
  meta?: Record<string, unknown>;
};

export async function logAuth(
  action: AuthAuditAction,
  opts: AuthAuditOptions,
): Promise<void> {
  try {
    await ensureIndexes();
    await (await authAuditCol()).insertOne({
      _id: new ObjectId(),
      ...opts,
      action,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Auth audit logging failed", error);
  }
}

export async function logAdminAction(
  userId: ObjectId,
  action: string,
  meta: Record<string, unknown>,
  ip: string,
  userAgent: string,
): Promise<void> {
  await logAuth("admin.action", {
    userId,
    ip,
    userAgent,
    meta: { action, ...meta },
  });
}