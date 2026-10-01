import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fail } from "@/lib/api-response";
import {
  requireAdmin,
  requireSession,
  requireStudent,
} from "@/lib/auth-guard";
import type { SessionPayload } from "@/lib/auth";

export type GuardOptions =
  | { kind: "public" }
  | { kind: "session" }
  | { kind: "admin" }
  | { kind: "student" };

type RouteContext = {
  params: Promise<Record<string, string>>;
};

type GuardHandler = (
  req: NextRequest,
  ctx: {
    session: SessionPayload | null;
    params: Record<string, string>;
  },
) => Promise<NextResponse>;

export function withGuard(
  opts: GuardOptions,
  handler: GuardHandler,
): (req: NextRequest, ctx: RouteContext) => Promise<NextResponse> {
  return async (req, ctx) => {
    try {
      let session: SessionPayload | null = null;

      if (opts.kind === "session") {
        session = await requireSession();
        if (!session) return fail("Not authenticated", 401);
      } else if (opts.kind === "admin") {
        session = await requireAdmin();
        if (!session) return fail("Forbidden", 403);
      } else if (opts.kind === "student") {
        session = await requireStudent();
        if (!session) return fail("Forbidden", 403);
      }

      const params = await ctx.params;
      return await handler(req, { session, params });
    } catch (error) {
      console.error("Guarded route error", error);
      return fail("Server error", 500);
    }
  };
}

export const guardRoute = withGuard;