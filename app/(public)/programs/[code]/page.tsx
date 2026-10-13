import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/sections/cta-band";
import { CategoryHero } from "@/components/sections/category-hero";
import { CategoryCoursesGrid } from "@/components/public/category-courses-grid";
import { CategoryFilter } from "@/components/public/category-filter";
import { QueryPagination } from "@/components/public/query-pagination";
import { listCoursesByCategory } from "@/lib/category-query";
import { getCategoryMeta, type CourseCategory } from "@/lib/types/course";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const safeCode = (code as CourseCategory) || "BJS";

  if (!(["BJS", "BAR", "LLB"] as const).includes(safeCode as CourseCategory)) {
    return {
      title: "Programs — LegalPath Bangladesh",
      description: "Explore BJS, BAR, and LLB programs.",
    };
  }

  const meta = getCategoryMeta(safeCode as CourseCategory);

  return {
    title: `${meta.label} — LegalPath Bangladesh`,
    description: meta.description,
  };
}

export default async function ProgramCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const { code } = await params;
  const category = code.toUpperCase();

  if (!(["BJS", "BAR", "LLB"] as const).includes(category as CourseCategory)) {
    notFound();
  }

  const safeCode = category as CourseCategory;
  const meta = getCategoryMeta(safeCode);
  const paramsObject = await searchParams;
  const page = Math.max(1, Number(paramsObject.page ?? 1) || 1);
  const type = paramsObject.type === "free" || paramsObject.type === "paid" ? paramsObject.type : "all";
  const search = paramsObject.search?.trim() ?? "";
  const result = await listCoursesByCategory(safeCode, {
    search,
    type,
    page,
    limit: 9,
  });

  return (
    <>
      <CategoryHero meta={meta} />
      <CategoryFilter currentCode={safeCode} />
      <CategoryCoursesGrid courses={result.courses} categoryCode={safeCode} />
      <QueryPagination
        page={result.pagination.page}
        totalPages={result.pagination.totalPages}
        total={result.pagination.total}
        limit={result.pagination.limit}
      />
      <CtaBand />
    </>
  );
}
