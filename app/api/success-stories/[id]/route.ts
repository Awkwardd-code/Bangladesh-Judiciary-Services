import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { successStoriesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import type { SuccessStory } from "@/lib/types/success-story";

function serializeStory(doc: SuccessStory) {
  const story = { ...doc };
  Reflect.deleteProperty(story, "authorEmail");
  Reflect.deleteProperty(story, "authorPhotoPublicId");
  Reflect.deleteProperty(story, "reviewedBy");
  return story;
}

export const GET = withGuard({ kind: "public" }, async (_req, { params }) => {
  try {
    await ensureIndexes();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return fail("Success story not found", 404);
    }

    const story = await (
      await successStoriesCol()
    ).findOne({
      _id: new ObjectId(id),
      status: "approved",
    });

    if (!story) {
      return fail("Success story not found", 404);
    }

    return ok({ story: serializeStory(story) });
  } catch (error) {
    console.error("Get public success story error", error);
    return fail("Server error", 500);
  }
});
