import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { successStoriesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta } from "@/lib/pagination";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withGuard } from "@/lib/route-guard";
import type { SuccessStory } from "@/lib/types/success-story";
import { successStoryPublicSubmitSchema } from "@/lib/validators/success-story";

function serializeStory(doc: SuccessStory) {
  const story = { ...doc };
  Reflect.deleteProperty(story, "authorEmail");
  Reflect.deleteProperty(story, "authorPhotoPublicId");
  Reflect.deleteProperty(story, "reviewedBy");
  return story;
}

export const GET = withGuard({ kind: "public" }, async (req) => {
  try {
    await ensureIndexes();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") ?? 12) || 12),
    );
    const skip = (page - 1) * limit;
    const featuredOnly = searchParams.get("featured") === "true";
    const filter = featuredOnly
      ? { status: "approved" as const, isFeatured: true }
      : { status: "approved" as const };
    const collection = await successStoriesCol();

    const [items, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ isFeatured: -1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return ok({
      stories: items.map(serializeStory),
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("Public success stories error", error);
    return fail("Server error", 500);
  }
});

export const POST = withGuard({ kind: "public" }, async (req) => {
  try {
    const limit = rateLimit({
      key: `story-submit:${getClientIp(req)}`,
      limit: 2,
      windowMs: 3_600_000,
    });

    if (!limit.allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body", 400);
    }

    const parsed = successStoryPublicSubmitSchema.safeParse(body);

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
      status: "pending" as const,
      isFeatured: false,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(document);

    return ok(
      { message: "Thank you. Your story has been submitted for review." },
      201,
    );
  } catch (error) {
    console.error("Submit success story error", error);
    return fail("Server error", 500);
  }
});
