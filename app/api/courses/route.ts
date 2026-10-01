import { ObjectId } from "mongodb";
import { fail, ok } from "@/lib/api-response";
import { getSessionFromCookies } from "@/lib/auth";
import { coursesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { getEnrollmentAccess } from "@/lib/enrollment";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard({ kind: "public" }, async (req) => {
  try {
    await ensureIndexes();
    const session = await getSessionFromCookies();

    const params = new URL(req.url).searchParams;
    const { page, limit } = parsePagination(params);
    const category = params.get("category")?.trim();

    const filter: Record<string, unknown> = {
      isPublished: true,
      status: "published",
    };

    if (category) {
      filter.category = category;
    }

    const collection = await coursesCol();
    const [courses, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const items = await Promise.all(
      courses.map(async (course) => {
        const access = session
          ? await getEnrollmentAccess(
              new ObjectId(session.userId),
              course._id,
            )
          : {
              hasAccess: course.price === 0,
              reason: course.price === 0 ? ("free" as const) : ("none" as const),
            };

        return {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.description,
          category: course.category,
          price: course.price,
          currency: course.currency,
          durationLabel: course.durationLabel,
          coverUrl: course.coverUrl ?? null,
          isPaid: course.price > 0,
          access: {
            hasAccess: access.hasAccess,
            reason: access.reason,
          },
        };
      }),
    );

    return ok({
      courses: items,
      pagination: buildPaginationMeta({ page, limit }, total),
    });
  } catch (error) {
    console.error("List courses error", error);
    return fail("Server error", 500);
  }
});
