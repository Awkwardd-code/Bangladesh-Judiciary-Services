import { ObjectId } from "mongodb";

import { requireSession } from "@/lib/auth-guard";
import { ok, fail } from "@/lib/api-response";
import { getActiveExam } from "@/lib/exam-lock";
import { ensureIndexes } from "@/lib/indexes";

export async function GET() {
  try {
    const session = await requireSession();

    if (!session) {
      return fail("Not authenticated", 401);
    }

    await ensureIndexes();

    const active = await getActiveExam(new ObjectId(session.userId));

    return ok({ active });
  } catch (error) {
    console.error("Error loading active exam:", error);
    return fail("Server error", 500);
  }
}
