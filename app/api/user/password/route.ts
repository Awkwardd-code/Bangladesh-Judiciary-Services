import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth";
import { logAuth } from "@/lib/audit";
import { requireSession } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: z.string().min(8).max(72),
  })
  .strict();

export async function POST(req: NextRequest) {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  const limit = rateLimit({
    key: `password:${getClientIp(req)}`,
    limit: 5,
    windowMs: 300_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return fail("Invalid request", 400);
  }

  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid password", 400);
  }

  try {
    await ensureIndexes();

    const userCollection = await usersCol();
    const user = await userCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return fail("User not found", 404);
    }

    const matches = await verifyPassword(
      parsed.data.currentPassword,
      user.password,
    );

    if (!matches) {
      return fail("Current password is incorrect", 401);
    }

    const password = await hashPassword(parsed.data.newPassword);

    await userCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password,
          sessionVersion: (user.sessionVersion ?? 1) + 1,
          updatedAt: new Date(),
        },
      },
    );

    await clearSessionCookie();
    await logAuth("password.change", {
      userId: user._id,
      email: user.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return ok({ message: "Password updated. Please log in again." });
  } catch (error) {
    console.error("Password update error", error);
    return fail("Server error", 500);
  }
}
