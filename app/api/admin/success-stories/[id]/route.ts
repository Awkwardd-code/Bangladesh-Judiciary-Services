import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteFile } from "@/lib/cloudinary";
import { successStoriesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getClientIp } from "@/lib/rate-limit";
import type { SuccessStory } from "@/lib/types/success-story";
import {
  successStoryModerationSchema,
  successStoryUpdateSchema,
} from "@/lib/validators/success-story";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Success story not found", 404);
    }

    const collection = await successStoriesCol();
    const doc = await collection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return fail("Success story not found", 404);
    }

    return ok({ story: serializeStory(doc) });
  } catch (error) {
    console.error("Get success story error", error);
    return fail("Server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Success story not found", 404);
    }

    const collection = await successStoriesCol();
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return fail("Success story not found", 404);
    }

    const bodyRecord =
      body !== null && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : null;
    const moderationOnly =
      bodyRecord !== null &&
      Object.keys(bodyRecord).length > 0 &&
      Object.keys(bodyRecord).every((key) =>
        ["status", "isFeatured"].includes(key),
      );
    let updateSet: Record<string, unknown>;

    if (moderationOnly && bodyRecord && "status" in bodyRecord) {
      const parsed = successStoryModerationSchema.safeParse(bodyRecord);

      if (!parsed.success) {
        return fail(
          parsed.error.issues[0]?.message ?? "Invalid moderation payload",
          400,
        );
      }

      updateSet = {
        status: parsed.data.status,
        isFeatured: parsed.data.isFeatured ?? existing.isFeatured,
        reviewedBy: new ObjectId(session.userId),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      const parsed = successStoryUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return fail(
          parsed.error.issues[0]?.message ?? "Invalid success story payload",
          400,
        );
      }

      updateSet = {
        ...parsed.data,
        updatedAt: new Date(),
      };
    }

    if (
      existing.authorPhotoPublicId &&
      "authorPhotoPublicId" in updateSet &&
      updateSet.authorPhotoPublicId !== existing.authorPhotoPublicId
    ) {
      void deleteFile(existing.authorPhotoPublicId, "image").catch((error) => {
        console.error("Delete replaced success story photo error", error);
      });
    }

    await collection.updateOne({ _id: existing._id }, { $set: updateSet });
    const updated = await collection.findOne({ _id: existing._id });

    if (!updated) {
      return fail("Success story not updated", 500);
    }

    await logAdminAction(
      new ObjectId(session.userId),
      "success-story.moderate",
      {
        storyId: updated._id.toString(),
        previousStatus: existing.status,
        status: updated.status,
      },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ story: serializeStory(updated) });
  } catch (error) {
    console.error("Update success story error", error);
    return fail("Server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return fail("Success story not found", 404);
    }
    const collection = await successStoriesCol();
    const story = await collection.findOne({ _id: new ObjectId(id) });

    if (!story) {
      return fail("Success story not found", 404);
    }

    if (story.authorPhotoPublicId) {
      try {
        await deleteFile(story.authorPhotoPublicId, "image");
      } catch (error) {
        console.error("Delete success story photo error", error);
      }
    }

    await collection.deleteOne({ _id: story._id });

    await logAdminAction(
      new ObjectId(session.userId),
      "success-story.delete",
      { storyId: story._id.toString() },
      getClientIp(req),
      req.headers.get("user-agent") ?? "unknown",
    );

    return ok({ message: "Story removed." });
  } catch (error) {
    console.error("Delete success story error", error);
    return fail("Server error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return await PATCH(req, { params });
  } catch (error) {
    console.error("Legacy moderate success story error", error);
    return fail("Server error", 500);
  }
}
