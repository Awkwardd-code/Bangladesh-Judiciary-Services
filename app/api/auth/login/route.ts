import { fail, ok } from "@/lib/api-response";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  setSessionCookie,
  signSession,
} from "@/lib/auth";
import { logAuth } from "@/lib/audit";
import { usersCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { verifyPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";
import { loginSchema } from "@/lib/validators/auth";

export const POST = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `login:${getClientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    await logAuth("login.blocked", {
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      meta: { reason: "rate-limit" },
    });
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return fail("Invalid request", 400);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid request", 400);
  }

  try {
    await ensureIndexes();

    const userCollection = await usersCol();
    const user = await userCollection.findOne({
      email: parsed.data.email,
    });

    if (!user) {
      await logAuth("login.failure", {
        email: parsed.data.email,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
        meta: { email: parsed.data.email },
      });
      return fail("Invalid credentials", 401);
    }

    const passwordMatches = await verifyPassword(
      parsed.data.password,
      user.password,
    );

    if (!passwordMatches) {
      await logAuth("login.failure", {
        userId: user._id,
        email: parsed.data.email,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
        meta: { email: parsed.data.email },
      });
      return fail("Invalid credentials", 401);
    }

    if (user.disabled === true) {
      await logAuth("login.blocked", {
        userId: user._id,
        email: user.email,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
        meta: { reason: "disabled" },
      });
      return fail("Your account has been disabled. Contact support.", 403);
    }

    if (user.tier === "OTHER" && !user.approved) {
      await logAuth("login.blocked", {
        userId: user._id,
        email: user.email,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
        meta: { reason: "not-approved" },
      });
      return fail("Your account is pending approval.", 403);
    }

    if (!user.verified) {
      await logAuth("login.blocked", {
        userId: user._id,
        email: user.email,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? "unknown",
        meta: { reason: "not-verified" },
      });
      return fail("Please verify your email", 403);
    }

    const now = new Date();

    await userCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          sessionVersion: user.sessionVersion ?? 1,
          lastLoginAt: now,
          updatedAt: now,
        },
      },
    );

    const token = await signSession({
      userId: user._id.toString(),
      role: user.isAdmin === 1 ? "admin" : "student",
      isAdmin: user.isAdmin === 1 ? 1 : 0,
      tier: user.tier,
      v: user.sessionVersion ?? 1,
      remember: parsed.data.remember ?? true,
      ip: getClientIp(req),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[login] setting cookie", {
        name: AUTH_COOKIE_NAME,
        secure: AUTH_COOKIE_OPTIONS.secure,
        sameSite: AUTH_COOKIE_OPTIONS.sameSite,
      });
    }

    await setSessionCookie(token);
    await logAuth("login.success", {
      userId: user._id,
      email: user.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return ok({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.isAdmin === 1 ? "admin" : "student",
        isAdmin: user.isAdmin,
        tier: user.tier,
        verified: user.verified,
        avatarUrl: user.avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return fail("Server error", 500);
  }
});
