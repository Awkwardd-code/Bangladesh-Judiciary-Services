import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { ensureIndexes } from "@/lib/indexes";
import { getDashboardStats } from "@/lib/stats";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  try {
    await ensureIndexes();
    const stats = await getDashboardStats();

    return ok({ stats });
  } catch (error) {
    console.error("Dashboard stats route error", error);
    return fail("Unable to load dashboard statistics", 500);
  }
}
