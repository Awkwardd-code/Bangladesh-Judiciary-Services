import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { mentorsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().regex(/^[\da-f]{24}$/i)),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    const body: unknown = await req.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid order", 400);
    }

    const { orderedIds } = parsed.data;

    if (new Set(orderedIds).size !== orderedIds.length) {
      return fail("Mentor ids must be unique", 400);
    }

    await ensureIndexes();

    if (orderedIds.length > 0) {
      const collection = await mentorsCol();
      const updatedAt = new Date();

      await collection.bulkWrite(
        orderedIds.map((id, order) => ({
          updateOne: {
            filter: { _id: new ObjectId(id) },
            update: { $set: { order, updatedAt } },
          },
        })),
      );
    }

    return ok({ message: "Order updated." });
  } catch (error) {
    console.error("Reorder mentors error", error);
    return fail("Server error", 500);
  }
}