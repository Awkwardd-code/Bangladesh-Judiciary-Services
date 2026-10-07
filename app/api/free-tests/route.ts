import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { freeTestsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getFreeTestAccess } from "@/lib/free-test-quota";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  try {
    await ensureIndexes();

    const access = await getFreeTestAccess(new ObjectId(session.userId));
    const tests = await (await freeTestsCol())
      .find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return ok({
      tests,
      quota: {
        used: access.freeAttemptsUsed,
        limit: access.freeAttemptsLimit,
        left: access.freeAttemptsLeft,
      },
    });
  } catch (error) {
    console.error("List published free tests error", error);
    return fail("Server error", 500);
  }
}
