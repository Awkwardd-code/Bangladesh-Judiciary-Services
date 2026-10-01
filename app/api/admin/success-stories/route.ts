import { ObjectId, type Filter } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { successStoriesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import type { SuccessStory } from "@/lib/types/success-story";
import { successStoryCreateSchema } from "@/lib/validators/success-story";

function serializeStory(doc: SuccessStory) {
  return {
    id: doc._id.toString(),
    authorName: doc.authorName,
    authorEmail: doc.authorEmail,
    authorUniversity: doc.authorUniversity,
    authorBatch: doc.authorBatch,
    authorPhotoUrl: doc.authorPhotoUrl ?? null,
    quote: doc.quote,
    fullStory: doc.fullStory ?? null,
    achievement: doc.achievement,
    yearOfSelection: doc.yearOfSelection ?? null,
    status: doc.status,
    isFeatured: doc.isFeatured,
    order: doc.order ?? 0,
    reviewedBy: doc.reviewedBy?.toString() ?? null,
    reviewedAt: doc.reviewedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();

    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(searchParams);
    const skip = (page - 1) * limit;
    const filter: Filter<SuccessStory> = {};
    const status = searchParams.get("status") ?? "all";
    const featured = searchParams.get("isFeatured") ?? "all";
    const search = searchParams.get("search")?.trim();

    if (
      status !== "all" &&
      ["pending", "approved", "rejected"].includes(status)
    ) {
      filter.status = status as SuccessStory["status"];
    }

    if (featured === "true" || featured === "false") {
      filter.isFeatured = featured === "true";
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { authorName: { $regex: escaped, $options: "i" } },
        { authorUniversity: { $regex: escaped, $options: "i" } },
      ];
    }

    const collection = await successStoriesCol();

    const [items, total, all, pending, approved, rejected, featuredTotal] =
      await Promise.all([
        collection
          .find(filter)
          .sort({ status: 1, isFeatured: -1, order: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(filter),
        collection.countDocuments({}),
        collection.countDocuments({ status: "pending" }),
        collection.countDocuments({ status: "approved" }),
        collection.countDocuments({ status: "rejected" }),
        collection.countDocuments({ isFeatured: true }),
      ]);

    return ok({
      stories: items.map(serializeStory),
      pagination: buildPaginationMeta({ page, limit }, total),
      summary: {
        total: all,
        pending,
        approved,
        rejected,
        featured: featuredTotal,
      },
    });
  } catch (error) {
    console.error("List success stories error", error);
    return fail("Server error", 500);
  }
}

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
      return fail("Invalid request", 400);
    }

    const parsed = successStoryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid success story payload",
        400,
      );
    }

    await ensureIndexes();

    const collection = await successStoriesCol();
    const now = new Date();
    const document = {
      _id: new ObjectId(),
      ...parsed.data,
      status: "approved" as const,
      reviewedBy: new ObjectId(session.userId),
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(document);
    const inserted = await collection.findOne({ _id: result.insertedId });

    if (!inserted) {
      return fail("Success story not created", 500);
    }

    return ok({ story: serializeStory(inserted) }, 201);
  } catch (error) {
    console.error("Create success story error", error);
    return fail("Server error", 500);
  }
}
