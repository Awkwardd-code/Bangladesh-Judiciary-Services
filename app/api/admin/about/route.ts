import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { aboutsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildDefaultAboutSeed } from "@/lib/seed/about-default";
import { aboutUpdateSchema } from "@/lib/validators/content";

function serializeAbout(doc: any) {
  const { _id, createdAt, updatedAt, updatedBy, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    updatedBy: updatedBy?.toString() ?? null,
    createdAt,
    updatedAt,
  };
}

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const collection = await aboutsCol();
    const doc = await collection.findOne({});

    if (!doc) {
      const seed = buildDefaultAboutSeed(new ObjectId(session.userId));
      await collection.insertOne(seed);
      return ok({ about: serializeAbout(seed) });
    }

    return ok({ about: serializeAbout(doc) });
  } catch (error) {
    console.error("Get about error", error);
    return fail("Server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return fail("Invalid request", 400);
  }

  const parsed = aboutUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid about payload", 400);
  }

  try {
    await ensureIndexes();

    const collection = await aboutsCol();
    const now = new Date();
    const userObjectId = new ObjectId(session.userId);
    const updatePayload = {
      ...parsed.data,
      updatedBy: userObjectId,
      updatedAt: now,
    };

    const existing = await collection.findOne({});

    if (!existing) {
      const seed = {
        ...buildDefaultAboutSeed(userObjectId),
        ...updatePayload,
        _id: new ObjectId(),
        createdAt: now,
      };
      await collection.insertOne(seed);
      return ok({ about: serializeAbout(seed) });
    }

    await collection.updateOne(
      { _id: existing._id },
      {
        $set: updatePayload,
      },
    );

    const updated = await collection.findOne({ _id: existing._id });

    if (!updated) {
      return fail("About page not found", 404);
    }

    return ok({ about: serializeAbout(updated) });
  } catch (error) {
    console.error("Update about error", error);
    return fail("Server error", 500);
  }
}
