import { fail, ok } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth";
import { logAuth } from "@/lib/audit";
import {
  passwordResetTokensCol,
  usersCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { hashPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `reset:${getClientIp(req)}`,
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

  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid request", 400);
  }

  try {
    await ensureIndexes();

    const tokenCollection = await passwordResetTokensCol();
    const userCollection = await usersCol();
    const tokenRecord = await tokenCollection.findOne({
      token: parsed.data.code,
    });

    if (!tokenRecord) {
      return fail("Invalid or expired link", 400);
    }

    if (tokenRecord.usedAt !== null) {
      return fail("Invalid or expired link", 400);
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      return fail("Invalid or expired link", 400);
    }

    const user = await userCollection.findOne({
      _id: tokenRecord.userId,
    });

    if (!user) {
      return fail("User not found", 404);
    }

    const now = new Date();
    const passwordHash = await hashPassword(parsed.data.password);

    await userCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: passwordHash,
          verified: true,
          sessionVersion: (user.sessionVersion ?? 1) + 1,
          updatedAt: now,
        },
      },
    );

    await tokenCollection.updateOne(
      { _id: tokenRecord._id },
      {
        $set: {
          usedAt: now,
        },
      },
    );

    await tokenCollection.deleteMany({
      userId: user._id,
      token: { $ne: parsed.data.code },
      usedAt: null,
    });

    await clearSessionCookie();

    await logAuth("password.reset", {
      userId: user._id,
      email: user.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return ok({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error", error);
    return fail("Server error", 500);
  }
});
