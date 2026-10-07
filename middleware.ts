import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

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
      (payload.tier !== "UNIVERSITY" && payload.tier !== "OTHER")
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password");

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isAuthRoute) {
    if (!token) {
      return response;
    }

    const payload = await verifyMiddlewareSession(token);

    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return response;
  }

  if (!isDashboard && !isAdmin) {
    return response;
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyMiddlewareSession(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && payload.role !== "admin") {
    const dashboardUrl = new URL("/dashboard?forbidden=1", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
