import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import type { Mentor } from "@/lib/types/mentor";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { mentorsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { deleteFile } from "@/lib/cloudinary";
import { mentorUpdateSchema } from "@/lib/validators/mentor";
import { getClientIp } from "@/lib/rate-limit";

function serializeMentor(doc: Mentor) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    title: doc.title,
    bio: doc.bio,
    photoUrl: doc.photoUrl,
    photoPublicId: doc.photoPublicId,
    specializations: doc.specializations ?? [],
    yearsOfExperience: doc.yearsOfExperience,
    order: doc.order ?? 0,
    isPublished: doc.isPublished,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Mentor not found", 404);
    }
    const collection = await mentorsCol();
    const doc = await collection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return fail("Mentor not found", 404);
    }

    return ok({ mentor: serializeMentor(doc) });
  } catch (error) {
    console.error("Get mentor detail error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const parsed = mentorUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Invalid mentor payload",
      400,
    );
  }

  try {
    await ensureIndexes();
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Mentor not found", 404);
    }
    const collection = await mentorsCol();
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return fail("Mentor not found", 404);
    }

    const updateSet = { ...parsed.data, updatedAt: new Date() };

    await collection.updateOne({ _id: existing._id }, { $set: updateSet });

    if (
      existing.photoPublicId &&
      parsed.data.photoPublicId !== undefined &&
      parsed.data.photoPublicId !== existing.photoPublicId
    ) {
      void deleteFile(existing.photoPublicId, "image").catch(() => undefined);
    }
    const updated = await collection.findOne({ _id: existing._id });

    if (!updated) {
      return fail("Mentor not updated", 500);
    }

    await logAdminAction(
      new ObjectId(session.userId),
      "mentor.update",
      { mentorId: updated._id.toString() },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ mentor: serializeMentor(updated) });
  } catch (error) {
    console.error("Update mentor error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Mentor not found", 404);
    }
    const collection = await mentorsCol();
    const mentorId = new ObjectId(id);
    const existing = await collection.findOne({ _id: mentorId });

    if (!existing) {
      return fail("Mentor not found", 404);
    }

    if (existing.photoPublicId) {
      try {
        await deleteFile(existing.photoPublicId, "image");
      } catch (error) {
        console.error("Delete mentor photo error", error);
      }
    }

    const result = await collection.deleteOne({ _id: mentorId });

    if (result.deletedCount === 0) {
      return fail("Mentor not found", 404);
    }

    await logAdminAction(
      new ObjectId(session.userId),
      "mentor.delete",
      { mentorId: mentorId.toString(), name: existing.name },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ message: "Mentor removed." });
  } catch (error) {
    console.error("Delete mentor error", error);
    return fail("Server error", 500);
  }
}
