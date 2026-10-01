import type { Metadata } from "next";
import type { Sort } from "mongodb";
import { coursesCol } from "@/lib/collections";
import type { CourseCategory } from "@/lib/types/course";

import { CoursesHero } from "@/components/sections/courses-hero";
import { CoursesFilter } from "@/components/public/courses-filter";
import { CoursesGrid } from "@/components/sections/courses-grid";
import { QueryPagination } from "@/components/public/query-pagination";
export const metadata: Metadata = {
  title: "Courses",
  description: "Structured courses for every stage of your BJS preparation.",
};
type CourseSearchParams = {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<CourseSearchParams>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 9;
  const filter: Record<string, unknown> = {
    isPublished: true,
    status: "published",
  };

  if (
    category &&
    ["preliminary", "written", "viva", "foundation"].includes(category)
  ) {
    filter.category = category as CourseCategory;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }

  const sort: Sort = params.sort === "low"
    ? { price: 1 as const, order: 1 as const }
    : params.sort === "high"
      ? { price: -1 as const, order: 1 as const }
      : { createdAt: -1 as const };
  const collection = await coursesCol();
  const [courses, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <CoursesHero />
      <CoursesFilter />
      <CoursesGrid courses={courses} />
      <QueryPagination page={page} totalPages={totalPages} total={total} limit={limit} />
    </>
  );
}
