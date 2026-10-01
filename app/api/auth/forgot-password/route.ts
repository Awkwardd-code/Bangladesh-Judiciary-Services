import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { logAuth } from "@/lib/audit";
import {
  passwordResetTokensCol,
  usersCol,
} from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { generateAlphanumericCode } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { withGuard } from "@/lib/route-guard";

export const POST = withGuard({ kind: "public" }, async (req) => {
  await logAuth("password.forgot", {
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent") ?? "unknown",
  });

  const limit = rateLimit({
    key: `forgot:${getClientIp(req)}`,
    limit: 3,
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

  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid request", 400);
  }

  try {
    await ensureIndexes();

    const userCollection = await usersCol();
    const tokenCollection = await passwordResetTokensCol();
    const user = await userCollection.findOne({
      email: parsed.data.email,
    });

    if (user) {
      await tokenCollection.deleteMany({ userId: user._id });

      const code = generateAlphanumericCode(15);
      const now = new Date();

      await tokenCollection.insertOne({
        _id: new ObjectId(),
        userId: user._id,
        token: code,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        usedAt: null,
        createdAt: now,
      } as any);

      try {
        await sendPasswordResetEmail(user.email, code);
      } catch (error) {
        console.error("Password reset email failed", error);
      }
    }

    return ok({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return fail("Server error", 500);
  }
});
