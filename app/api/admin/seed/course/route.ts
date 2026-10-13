import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { ensureIndexes } from "@/lib/indexes";
import { runCourseSeed } from "@/lib/seed/run-course-seed";

export async function POST() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const result = await runCourseSeed(new ObjectId(session.userId));

    return ok({
      result,
      message: result.skipped
        ? "Course already seeded."
        : "Course seeded successfully.",
    });
  } catch (error) {
    console.error("Seed starter course error", error);
    return fail("Unable to seed the starter course.", 500);
  }
}
