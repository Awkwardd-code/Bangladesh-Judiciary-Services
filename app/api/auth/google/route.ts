import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { fail } from "@/lib/api-response";
import { env } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";

type OAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  nextPath: string;
};

const STATE_COOKIE = "bjs_google_oauth";

export const GET = withGuard({ kind: "public" }, async (req) => {
  const limit = rateLimit({
    key: `google-auth:${getClientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return fail("Too many requests. Please try again later.", 429);
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=google", req.url));
  }

  const state: OAuthState = {
    state: randomBytes(32).toString("base64url"),
    nonce: randomBytes(32).toString("base64url"),
    verifier: randomBytes(32).toString("base64url"),
    nextPath: safeNextPath(req.nextUrl.searchParams.get("next")),
  };
  const challenge = createHash("sha256")
    .update(state.verifier)
    .digest("base64url");
  const callbackUrl = new URL(
    "/api/auth/google/callback",
    env.NEXT_PUBLIC_APP_URL,
  );
  const authorizationUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );

  authorizationUrl.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl.toString(),
    response_type: "code",
    scope: "openid email profile",
    state: state.state,
    nonce: state.nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(
    STATE_COOKIE,
    Buffer.from(JSON.stringify(state)).toString("base64url"),
    {
      httpOnly: true,
      secure: env.COOKIE_SECURE || env.COOKIE_SAME_SITE === "none",
      sameSite: env.COOKIE_SAME_SITE,
      path: "/api/auth/google",
      maxAge: 600,
    },
  );

  return response;
});

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }

  return value;
}