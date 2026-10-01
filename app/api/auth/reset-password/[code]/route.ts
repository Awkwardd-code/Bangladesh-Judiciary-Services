import { fail, ok } from "@/lib/api-response";
import { passwordResetTokensCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard({ kind: "public" }, async (_req, { params }) => {
  const limit = rateLimit({
    key: `reset-code:${getClientIp(_req)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  try {
    const { code } = params;

    await ensureIndexes();

    const tokenCollection = await passwordResetTokensCol();
    const token = await tokenCollection.findOne({ token: code });

    if (!token) {
      return fail("Invalid or expired link", 400);
    }

    if (token.usedAt !== null) {
      return fail("This link has already been used", 400);
    }

    if (token.expiresAt.getTime() < Date.now()) {
      return fail("Invalid or expired link", 400);
    }

    return ok({ valid: true });
  } catch (error) {
    console.error("Reset code validation error", error);
    return fail("Server error", 500);
  }
});
