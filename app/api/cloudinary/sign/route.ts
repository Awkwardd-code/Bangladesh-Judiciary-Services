import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";

export async function POST() {
  const session = await requireSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  return ok({ message: "Unsigned uploads only." }, 501);
}
