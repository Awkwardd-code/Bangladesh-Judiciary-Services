import { NextRequest } from "next/server";
import { ObjectId, type Filter } from "mongodb";
import type { Mentor } from "@/lib/types/mentor";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { mentorsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { getClientIp } from "@/lib/rate-limit";
import { mentorCreateSchema } from "@/lib/validators/mentor";

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

export async function GET(req: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return fail("Forbidden", 403);
  }

  try {
    await ensureIndexes();

    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(searchParams);
    const search = searchParams.get("search")?.trim() ?? "";
    const published = searchParams.get("isPublished") ?? "all";
    const filter: Filter<Mentor> = {};

    if (published === "true" || published === "false") {
      filter.isPublished = published === "true";
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { title: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const collection = await mentorsCol();
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return ok({
      mentors: items.map(serializeMentor),
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List mentors error", error);
    return fail("Server error", 500);
  }
}

export async function POST(req: NextRequest) {
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

  const parsed = mentorCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Invalid mentor payload",
      400,
    );
  }

  try {
    await ensureIndexes();

    const collection = await mentorsCol();
    const now = new Date();
    const document = {
      _id: new ObjectId(),
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(document);
    const inserted = await collection.findOne({ _id: result.insertedId });

    if (!inserted) {
      return fail("Mentor not created", 500);
    }

    await logAdminAction(
      new ObjectId(session.userId),
      "mentor.create",
      { mentorId: inserted._id.toString(), name: inserted.name },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ mentor: serializeMentor(inserted) }, 201);
  } catch (error) {
    console.error("Create mentor error", error);
    return fail("Server error", 500);
  }
}
