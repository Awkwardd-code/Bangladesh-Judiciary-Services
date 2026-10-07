import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const headerStore = await headers();
  const rawCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  const rawCookieHeader = headerStore.get("cookie") ?? "";
  const token = rawCookie || rawCookieHeader;

  const payload = token ? await verifySession(token) : null;

  return NextResponse.json({
    hasCookie: Boolean(rawCookie),
    verified: Boolean(payload),
    error: payload ? null : "invalid or missing session cookie",
  });
}
