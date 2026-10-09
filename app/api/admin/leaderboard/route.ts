import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { listLeaderboard } from "@/lib/leaderboard-query";

const querySchema = z.object({
  examId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  examKind: z.enum(["preliminary", "written", "free", "all"]).optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    const params = Object.fromEntries(
      new URL(request.url).searchParams.entries()
    );
    const parsed = querySchema.safeParse(params);

    if (!parsed.success) {
      return fail("Invalid leaderboard filters.", 400, {
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const rows = await listLeaderboard({
      ...parsed.data,
      examKind:
        parsed.data.examKind && parsed.data.examKind !== "all"
          ? parsed.data.examKind
          : undefined,
    });

    return ok({ rows });
  } catch (error) {
    console.error("List leaderboard error", error);
    return fail("Server error", 500);
  }
}
