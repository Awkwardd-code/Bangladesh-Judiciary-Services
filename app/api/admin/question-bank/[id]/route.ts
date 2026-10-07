import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import {
  preliminaryQuestionsCol,
  writtenQuestionsCol,
} from "@/lib/collections";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) return fail("Forbidden", 403);

  try {
    const { id } = await params;
    const _id = new ObjectId(id);
    const collectionName = new URL(_request.url).searchParams.get("collection");

    if (!collectionName || !["preliminary_questions", "written_questions"].includes(collectionName)) {
      return fail("Missing or invalid collection", 400);
    }

    const target =
      collectionName === "preliminary_questions"
        ? await preliminaryQuestionsCol()
        : await writtenQuestionsCol();

    const result = await target.deleteOne({ _id });
    return ok({ deleted: result.deletedCount ?? 0 });
  } catch (error) {
    console.error("Delete question bank item error", error);
    return fail("Server error", 500);
  }
}
