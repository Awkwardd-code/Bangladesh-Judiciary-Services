import { fail, ok } from "@/lib/api-response";
import { aboutsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import { buildDefaultAboutSeed } from "@/lib/seed/about-default";

function serializeAbout(doc: any) {
  const { _id, createdAt, updatedAt, updatedBy, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    createdAt,
    updatedAt,
  };
}

export const GET = withGuard({ kind: "public" }, async () => {
  try {
    await ensureIndexes();

    const collection = await aboutsCol();
    const doc = await collection.findOne({});

    if (!doc) {
      const seed = buildDefaultAboutSeed();
      await collection.insertOne(seed);
      return ok({ about: serializeAbout(seed) });
    }

    return ok({ about: serializeAbout(doc) });
  } catch (error) {
    console.error("Get public about error", error);
    return fail("Server error", 500);
  }
});
