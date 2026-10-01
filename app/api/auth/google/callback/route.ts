import { randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, signSession } from "@/lib/auth";
import { logAuth } from "@/lib/audit";
import { fail } from "@/lib/api-response";
import { usersCol } from "@/lib/collections";
import { env } from "@/lib/env";
import { ensureIndexes } from "@/lib/indexes";
import { hashPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";

type OAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  nextPath: string;
};

type GoogleTokenResponse = {
  id_token?: string;
};

const STATE_COOKIE = "bjs_google_oauth";
const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export const GET = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `google-callback:${getClientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  const storedState = readOAuthState(req.cookies.get(STATE_COOKIE)?.value);
  const stateParam = req.nextUrl.searchParams.get("state");
  const code = req.nextUrl.searchParams.get("code");

  if (
    !storedState ||
    !stateParam ||
    storedState.state !== stateParam ||
    !code ||
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET
  ) {
    return loginRedirect("google");
  }

  try {
    const callbackUrl = new URL(
      "/api/auth/google/callback",
      env.NEXT_PUBLIC_APP_URL,
    );
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl.toString(),
        grant_type: "authorization_code",
        code_verifier: storedState.verifier,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      return loginRedirect("google");
    }

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokens.id_token) {
      return loginRedirect("google");
    }

    const { payload } = await jwtVerify(tokens.id_token, googleJwks, {
      audience: env.GOOGLE_CLIENT_ID,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    const googleId = payload.sub;
    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const picture =
      typeof payload.picture === "string" ? payload.picture : null;

    if (
      payload.nonce !== storedState.nonce ||
      typeof googleId !== "string" ||
      !email ||
      payload.email_verified !== true
    ) {
      return loginRedirect("google");
    }

    await ensureIndexes();
    const users = await usersCol();
    let user = await users.findOne({ email });

    if (user?.googleId && user.googleId !== googleId) {
      return loginRedirect("google");
    }

    if (user?.disabled === true || (user?.tier === "OTHER" && !user.approved)) {
      return loginRedirect("google");
    }

    if (user) {
      const now = new Date();
      const profileUpdates = {
        ...(name && !user.name.trim() ? { name } : {}),
        ...(picture && !user.avatarUrl?.trim() ? { avatarUrl: picture } : {}),
      };

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId,
            verified: true,
            ...profileUpdates,
            lastLoginAt: now,
            updatedAt: now,
          },
        },
      );
      user = {
        ...user,
        googleId,
        verified: true,
        name: user.name.trim() ? user.name : name || user.name,
        avatarUrl: user.avatarUrl?.trim()
          ? user.avatarUrl
          : (picture ?? undefined),
        lastLoginAt: now,
      };
    } else {
      const now = new Date();
      const password = await hashPassword(
        randomBytes(32).toString("base64url"),
      );
      const result = await users.insertOne({
        _id: new ObjectId(),
        name: name || email.split("@")[0],
        email,
        password,
        googleId,
        role: "student",
        isAdmin: 0,
        tier: "OTHER",
        sessionVersion: 1,
        disabled: false,
        avatarUrl: picture ?? undefined,
        verified: true,
        approved: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
      user = {
        _id: result.insertedId,
        name: name || email.split("@")[0],
        email,
        password,
        googleId,
        role: "student",
        isAdmin: 0,
        tier: "OTHER",
        sessionVersion: 1,
        disabled: false,
        avatarUrl: picture ?? undefined,
        verified: true,
        approved: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
    }

    const session = await signSession({
      userId: user._id.toString(),
      role: user.isAdmin === 1 ? "admin" : "student",
      isAdmin: user.isAdmin === 1 ? 1 : 0,
      tier: user.tier,
      v: user.sessionVersion ?? 1,
      ip: getClientIp(req),
    });
    await logAuth("login.success", {
      userId: user._id,
      email: user.email,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? "unknown",
      meta: { provider: "google" },
    });
    const destination = new URL(
      user.isAdmin === 1 ? "/admin" : safeNextPath(storedState.nextPath),
      env.NEXT_PUBLIC_APP_URL,
    );
    const response = NextResponse.redirect(destination);

    response.cookies.set(AUTH_COOKIE_NAME, session, {
      httpOnly: true,
      secure: env.COOKIE_SECURE || env.COOKIE_SAME_SITE === "none",
      sameSite: env.COOKIE_SAME_SITE,
      path: "/",
      maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    });
    clearOAuthCookie(response);
    return response;
  } catch (error) {
    console.error("Google sign-in error", error);
    return loginRedirect("google");
  }
});

function readOAuthState(value: string | undefined): OAuthState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as OAuthState;
    if (
      typeof parsed.state !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.verifier !== "string" ||
      typeof parsed.nextPath !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function safeNextPath(value: string): string {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/dashboard";
  }

  return value;
}

function loginRedirect(error: string): NextResponse {
  const response = NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent(error)}`,
      env.NEXT_PUBLIC_APP_URL,
    ),
  );
  clearOAuthCookie(response);
  return response;
}

function clearOAuthCookie(response: NextResponse): void {
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 0,
  });
}
