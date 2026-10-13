"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { getCategoryMeta } from "@/lib/types/course";

type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  price: number;
  durationLabel: string;
  totalClasses: number;
  totalMockTests: number;
  isPublished: boolean;
  status: "draft" | "published" | "archived";
  category: "BJS" | "BAR" | "LLB";
  order: number;
};

export function CoursesListClient({
  initialCourses,
  programKind = "course",
}: {
  initialCourses: CourseListItem[];
  programKind?: "course" | "exam";
}) {
  const isExamCourse = programKind === "exam";
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            {isExamCourse ? "Exam Courses" : "Courses"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isExamCourse
              ? "Manage standalone exam courses, test structure, examiners, and routines."
              : "Manage courses across BJS, BAR, and LLB programs."}
          </p>
        </div>

        <Link
          href={isExamCourse ? "/admin/exam-courses/new" : "/admin/courses/new"}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isExamCourse ? "New exam course" : "New course"}
        </Link>
      </div>

      {!isExamCourse ? (
        <div className="flex flex-wrap gap-2">
          {(["BJS", "BAR", "LLB"] as const).map((code) => (
            <Link
              key={code}
              href={`/admin/courses?category=${code}`}
              className="inline-flex cursor-pointer items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5"
            >
              {getCategoryMeta(code).label}
            </Link>
          ))}
        </div>
      ) : null}

      {initialCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mb-3 flex justify-center text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-primary">
            {isExamCourse ? "No exam courses yet." : "No courses yet."}
          </h2>
          <div className="mt-5 flex justify-center">
            <Link
              href={
                isExamCourse ? "/admin/exam-courses/new" : "/admin/courses/new"
              }
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
            >
              {isExamCourse
                ? "Create your first exam course"
                : "Create your first course"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialCourses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10">
                {course.coverUrl ? (
                  <Image
                    src={course.coverUrl}
                    alt={course.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted">
                    {course.status}
                  </span>
                  <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-accent">
                    {getCategoryMeta(course.category).shortLabel}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-semibold text-primary">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {isExamCourse
                      ? `${course.durationLabel} · Exam preparation`
                      : `${course.durationLabel} · ${course.totalClasses} classes · ${course.totalMockTests} tests`}
                  </p>
                </div>

                <div className="text-sm font-medium text-primary">
                  {course.price > 0
                    ? `BDT ${course.price.toLocaleString()}`
                    : "Free"}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`${isExamCourse ? "/admin/exam-courses" : "/admin/courses"}/${course.id}`}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-muted/5"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-sm text-cream hover:bg-primary-dark"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
