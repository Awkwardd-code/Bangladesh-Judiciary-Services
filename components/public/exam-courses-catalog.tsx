"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  LockKeyhole,
  Scale,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CourseAccess } from "@/components/courses/course-detail-types";
import { getCategoryMeta, type CourseCategory } from "@/lib/types/course";

type ExamCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl?: string;
  category: CourseCategory;
  price: number;
  discountPercent?: number;
  durationLabel: string;
  totalMockTests: number;
};

const categories: Array<CourseCategory | "all"> = ["all", "BJS", "BAR", "LLB"];

export function ExamCoursesCatalog({
  courses,
  accessByCourse,
}: {
  courses: ExamCourse[];
  accessByCourse: Record<string, CourseAccess>;
}) {
  const [activeCategory, setActiveCategory] = useState<CourseCategory | "all">(
    "all"
  );
  const visibleCourses = useMemo(
    () =>
      activeCategory === "all"
        ? courses
        : courses.filter((course) => course.category === activeCategory),
    [activeCategory, courses]
  );

  return (
    <section className="bg-cream px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            EXAM COURSES
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
            Practice with purpose.
            <span className="block text-accent">Prepare for exam day.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
            Choose a focused exam course with structured tests, a clear routine,
            and preparation tailored to your program.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Filter exam courses by program"
            className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm lg:sticky lg:top-24 lg:flex-col"
          >
            {categories.map((category) => {
              const selected = activeCategory === category;
              const label =
                category === "all"
                  ? "All programs"
                  : getCategoryMeta(category).shortLabel;
              const count =
                category === "all"
                  ? courses.length
                  : courses.filter((course) => course.category === category)
                      .length;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors lg:w-full ${
                    selected
                      ? "bg-primary text-cream"
                      : "text-primary hover:bg-primary/5"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {category === "all" ? (
                      <BookOpen aria-hidden="true" size={16} />
                    ) : (
                      <Scale aria-hidden="true" size={16} />
                    )}
                    {label}
                  </span>
                  <span
                    className={`text-xs ${
                      selected ? "text-cream/70" : "text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {visibleCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <BookOpen className="mx-auto text-muted" size={36} />
              <h3 className="mt-4 font-heading text-xl font-semibold text-primary">
                {courses.length === 0
                  ? "Exam courses are coming soon"
                  : `No ${getCategoryMeta(activeCategory as CourseCategory).shortLabel} exam courses yet`}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {courses.length === 0
                  ? "Check back soon for new courses and test batches."
                  : "Choose another program to explore available courses."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCourses.map((course) => {
                const access = accessByCourse[course.id];
                const hasDiscount =
                  course.price > 0 && (course.discountPercent ?? 0) > 0;
                const currentPrice = hasDiscount
                  ? Math.round(
                      course.price * (1 - (course.discountPercent ?? 0) / 100)
                    )
                  : course.price;
                const categoryMeta = getCategoryMeta(course.category);

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-primary/5">
                      <Image
                        src={course.coverUrl ?? "/course-placeholder.svg"}
                        alt={course.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-card/95 px-3 py-1 text-xs font-semibold text-primary">
                        {categoryMeta.shortLabel}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                          <Clock aria-hidden="true" size={13} />
                          {course.durationLabel}
                        </span>
                        <span className="rounded-full bg-background px-2.5 py-1">
                          {course.totalMockTests} tests
                        </span>
                      </div>

                      <h3 className="mt-4 line-clamp-2 font-heading text-xl font-semibold text-primary">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {course.description}
                      </p>

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-border pt-5">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                            Course fee
                          </p>
                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="font-heading text-xl font-bold text-primary">
                              {currentPrice > 0
                                ? `৳${currentPrice.toLocaleString()}`
                                : "Free"}
                            </span>
                            {hasDiscount ? (
                              <span className="text-sm text-muted line-through">
                                ৳{course.price.toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <span
                          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                            access?.hasAccess
                              ? "bg-emerald-50 text-emerald-700"
                              : access?.reason === "pending"
                                ? "bg-background text-muted"
                                : "bg-accent-soft text-primary-dark group-hover:bg-accent-soft/90"
                          }`}
                        >
                          {access?.hasAccess ? (
                            <>
                              <Check aria-hidden="true" size={15} />
                              Enrolled
                            </>
                          ) : access?.reason === "pending" ? (
                            <>
                              <LockKeyhole aria-hidden="true" size={14} />
                              Pending
                            </>
                          ) : (
                            <>
                              Enroll test
                              <ArrowRight
                                aria-hidden="true"
                                size={15}
                                className="transition-transform group-hover:translate-x-0.5"
                              />
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
