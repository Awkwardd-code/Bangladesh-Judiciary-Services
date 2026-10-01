import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "bjs_auth";

async function verifyMiddlewareSession(token: string) {
  const secretValue = process.env.JWT_SECRET;

  if (!secretValue) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "student" && payload.role !== "admin") ||
      (payload.isAdmin !== undefined &&
        payload.isAdmin !== 0 &&
        payload.isAdmin !== 1)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = normalizePathname(req.nextUrl.pathname);

  if (pathname !== req.nextUrl.pathname) {
    const normalizedUrl = req.nextUrl.clone();
    normalizedUrl.pathname = pathname;
    return redirectWithPathHeader(normalizedUrl, pathname);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password") ||
    pathname === "/verify" ||
    pathname.startsWith("/verify/");

  if (!isProtected && !isAuthPage) {
    return response;
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return isProtected
      ? redirectToLogin(req, pathname)
      : response;
  }

  const session = await verifyMiddlewareSession(token);

  if (!session) {
    return isProtected
      ? redirectToLogin(req, pathname)
      : response;
  }

  const refreshedToken = await refreshMiddlewareToken(session);

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const redirect = redirectWithPathHeader(
      new URL("/dashboard?forbidden=1", req.url),
      pathname,
    );
    if (refreshedToken) {
      setSessionCookie(redirect, refreshedToken, session.remember !== false);
    }
    return redirect;
  }

  if (
    isAuthPage &&
    req.nextUrl.searchParams.get("session") !== "invalid" &&
    !pathname.startsWith("/reset-password") &&
    pathname !== "/verify" &&
    !pathname.startsWith("/verify/")
  ) {
    const redirect = redirectWithPathHeader(
      new URL("/dashboard", req.url),
      pathname,
    );
    if (refreshedToken) {
      setSessionCookie(redirect, refreshedToken, session.remember !== false);
    }
    return redirect;
  }

  if (refreshedToken) {
    setSessionCookie(response, refreshedToken, session.remember !== false);
  }
  return response;
}

function normalizePathname(pathname: string): string {
  const segments = pathname.split("/");
  const firstSegment = segments[1]?.toLowerCase();
  const managedSegments = new Set([
    "admin",
    "dashboard",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verify",
  ]);

  if (firstSegment && managedSegments.has(firstSegment)) {
    segments[1] = firstSegment;
  }

  let normalized = segments.join("/");
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function redirectToLogin(req: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", getSafeNext(pathname));
  return redirectWithPathHeader(loginUrl, pathname);
}

function getSafeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function redirectWithPathHeader(url: URL, pathname: string): NextResponse {
  const redirect = NextResponse.redirect(url);
  redirect.headers.set("x-pathname", pathname);
  return redirect;
}

async function refreshMiddlewareToken(
  session: Awaited<ReturnType<typeof verifyMiddlewareSession>>,
): Promise<string | null> {
  if (!session) return null;

  const issuedAt = typeof session.iat === "number" ? session.iat : 0;
  const refreshAfterDays = Number(process.env.SESSION_REFRESH_AFTER_DAYS ?? 6);
  const threshold =
    Number.isFinite(refreshAfterDays) && refreshAfterDays > 0
      ? refreshAfterDays * 24 * 60 * 60
      : 6 * 24 * 60 * 60;

  if (Math.floor(Date.now() / 1000) - issuedAt < threshold) {
    return null;
  }

  const secretValue = process.env.JWT_SECRET;
  if (!secretValue) return null;

  const maxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);
  const expiryDays =
    Number.isFinite(maxAgeDays) && maxAgeDays > 0 ? maxAgeDays : 7;
  const claims = {
    userId: session.userId,
    role: session.role,
    isAdmin: session.isAdmin,
    tier: session.tier,
    v: typeof session.v === "number" ? session.v : 1,
    remember: typeof session.remember === "boolean" ? session.remember : true,
    ...(typeof session.ip === "string" ? { ip: session.ip } : {}),
  };

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(new TextEncoder().encode(secretValue));
}

function setSessionCookie(
  response: NextResponse,
  token: string,
  remember: boolean,
) {
  const sameSite = process.env.COOKIE_SAME_SITE;
  const configuredMaxAge = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);
  const maxAgeDays =
    Number.isFinite(configuredMaxAge) && configuredMaxAge > 0
      ? configuredMaxAge
      : 7;

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.COOKIE_SECURE === "true" ||
      sameSite === "none",
    sameSite:
      sameSite === "strict" || sameSite === "none" ? sameSite : "lax",
    path: "/",
    ...(remember ? { maxAge: maxAgeDays * 24 * 60 * 60 } : {}),
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/reset-password/:path*",
    "/verify/:path*",
  ],
};
