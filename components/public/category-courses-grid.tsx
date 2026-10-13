"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { buildQuery } from "@/lib/query-params";
import { getCategoryMeta, type CourseCategory } from "@/lib/types/course";
import type { PublicCourse } from "@/lib/category-query";

export function CategoryCoursesGrid({
  courses,
  categoryCode,
}: {
  courses: PublicCourse[];
  categoryCode: CourseCategory;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "all";
  const categoryMeta = getCategoryMeta(categoryCode);

  function updateQuery(key: string, value: string) {
    const query = buildQuery(current, { [key]: value, page: 1 });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <section className="bg-cream px-6 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(value) => updateQuery("search", value)}
              placeholder={`Search ${categoryMeta.shortLabel} courses`}
              className="max-w-xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <FilterSelect
              value={type}
              onValueChange={(value) => updateQuery("type", value)}
              aria-label="Filter courses by cost"
              options={[
                { value: "all", label: "All" },
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
              ]}
            />
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 cursor-pointer items-center rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-muted/5"
            >
              Clear filters
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
              <BookOpen aria-hidden="true" size={22} />
            </div>
            <h3 className="mt-4 font-heading text-xl font-semibold text-primary">
              No courses in this program yet.
            </h3>
            <p className="mt-2 text-sm text-muted">
              Check back soon or browse other programs.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course._id.toString()}
                href={`/courses/${course.slug}`}
                className="group block cursor-pointer rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-primary/10">
                  {course.coverUrl ? (
                    <Image
                      src={course.coverUrl}
                      alt={course.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary/30">
                      <BookOpen aria-hidden="true" size={32} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                        {getCategoryMeta(course.category).shortLabel}
                      </span>
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted">
                        {course.programKind === "exam"
                          ? "Model test batch"
                          : "Course"}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {course.type === "free"
                        ? "Free"
                        : `BDT ${course.price.toLocaleString()}`}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-primary">
                    {course.title}
                  </h3>

                  <p className="line-clamp-2 text-sm leading-6 text-muted">
                    {course.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-[11px] text-muted">
                    <Clock aria-hidden="true" size={12} />
                    <span>
                      {course.durationLabel} · {course.totalClasses} classes · {course.totalMockTests} tests
                    </span>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    View course
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
