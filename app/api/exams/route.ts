import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { withGuard } from "@/lib/route-guard";
import { listUnifiedExams } from "@/lib/exams-query";

const querySchema = z.object({
  search: z.string().trim().optional(),
  scope: z.enum(["all", "free", "paid"]).optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(12),
});

export const GET = withGuard({ kind: "public" }, async (req) => {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.safeParse(params);

    if (!parsed.success) {
      return fail("Invalid query parameters.", 400);
    }

    const result = await listUnifiedExams({
      search: parsed.data.search,
      scope: parsed.data.scope,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return ok({
      exams: result.exams,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("List unified exams error", error);
    return fail("Server error", 500);
  }
});
