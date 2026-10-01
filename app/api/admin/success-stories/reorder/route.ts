import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { successStoriesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { successStoryReorderSchema } from "@/lib/validators/success-story";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = successStoryReorderSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid story order",
        400,
      );
    }

    const { orderedIds } = parsed.data;

    if (new Set(orderedIds).size !== orderedIds.length) {
      return fail("Story IDs must be unique", 400);
    }

    await ensureIndexes();
    const collection = await successStoriesCol();
    const objectIds = orderedIds.map((id) => new ObjectId(id));
    const existingCount = await collection.countDocuments({
      _id: { $in: objectIds },
    });

    if (existingCount !== orderedIds.length) {
      return fail("One or more stories were not found", 404);
    }

    const now = new Date();
    await collection.bulkWrite(
      objectIds.map((id, order) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order, updatedAt: now } },
        },
      })),
    );

    return ok({ message: "Order updated." });
  } catch (error) {
    console.error("Reorder success stories error", error);
    return fail("Server error", 500);
  }
}
