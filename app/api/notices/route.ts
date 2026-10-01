import { ok, fail } from "@/lib/api-response";
import { noticesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard({ kind: "public" }, async (req) => {
  try {
    await ensureIndexes();
    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const collection = await noticesCol();
    const filter = { status: "published" as const };
    const [items, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ pinned: -1, publishedAt: -1 })
        .skip((page - 1) * Math.min(limit, 30))
        .limit(Math.min(limit, 30))
        .toArray(),
      collection.countDocuments(filter),
    ]);
    return ok({
      notices: items.map(
        ({ _id, title, body, excerpt, pinned, publishedAt, createdAt }) => ({
          _id,
          title,
          body,
          excerpt,
          pinned,
          publishedAt,
          createdAt,
        }),
      ),
      pagination: buildPaginationMeta(
        { page, limit: Math.min(limit, 30) },
        total,
      ),
    });
  } catch (error) {
    console.error("List public notices error", error);
    return fail("Server error", 500);
  }
});
