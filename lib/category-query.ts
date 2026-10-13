import { coursesCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { buildPaginationMeta } from "@/lib/pagination";
import type { Course, CourseCategory } from "@/lib/types/course";
import { getCategoryMeta } from "@/lib/types/course";

export type CategorySummary = {
  code: CourseCategory;
  label: string;
  shortLabel: string;
  description: string;
  totalCourses: number;
  paidCourses: number;
  freeCourses: number;
};

export type PublicCourse = Pick<
  Course,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "coverUrl"
  | "category"
  | "price"
  | "durationLabel"
  | "totalClasses"
  | "totalMockTests"
  | "type"
  | "programKind"
>;

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  await ensureIndexes();

  const categoryCodes: CourseCategory[] = ["BJS", "BAR", "LLB"];

  const summaries = await Promise.all(
    categoryCodes.map(async (code) => {
      const meta = getCategoryMeta(code);
      const collection = await coursesCol();
      const baseFilter = {
        category: code,
        isPublished: true,
        status: "published" as const,
      };

      const [totalCourses, paidCourses, freeCourses] = await Promise.all([
        collection.countDocuments(baseFilter),
        collection.countDocuments({ ...baseFilter, type: "paid" as const }),
        collection.countDocuments({ ...baseFilter, type: "free" as const }),
      ]);

      return {
        code,
        label: meta.label,
        shortLabel: meta.shortLabel,
        description: meta.description,
        totalCourses,
        paidCourses,
        freeCourses,
      };
    }),
  );

  return summaries;
}

export async function listCoursesByCategory(
  category: CourseCategory,
  filters: {
    search?: string;
    type?: "free" | "paid" | "all";
    page: number;
    limit: number;
  },
): Promise<{
  courses: PublicCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  await ensureIndexes();

  const filter: Record<string, unknown> = {
    category,
    isPublished: true,
    status: "published",
  };

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tags: { $in: [new RegExp(escaped, "i")] } },
    ];
  }

  if (filters.type && filters.type !== "all") {
    filter.type = filters.type;
  }

  const collection = await coursesCol();
  const [records, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    courses: records.map((course) => ({
      _id: course._id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      coverUrl: course.coverUrl ?? undefined,
      category: course.category,
      price: course.price,
      durationLabel: course.durationLabel,
      totalClasses: course.totalClasses,
      totalMockTests: course.totalMockTests,
      type: course.type,
      programKind: course.programKind ?? "course",
    })),
    pagination: buildPaginationMeta(
      { page: filters.page, limit: filters.limit },
      total,
    ),
  };
}
