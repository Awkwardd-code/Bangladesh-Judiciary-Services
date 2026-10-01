import { fail, ok } from "@/lib/api-response";
import { mentorsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import type { PublicMentor } from "@/lib/types/mentor";

export const GET = withGuard({ kind: "public" }, async () => {
  try {
    await ensureIndexes();
    const collection = await mentorsCol();
    const items = await collection
      .find({ isPublished: true })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    const mentors: PublicMentor[] = items.map((mentor) => {
      const publicMentor = { ...mentor };
      Reflect.deleteProperty(publicMentor, "photoPublicId");
      return publicMentor;
    });

    return ok({ mentors });
  } catch (error) {
    console.error("Public mentors list error", error);
    return fail("Server error", 500);
  }
});
