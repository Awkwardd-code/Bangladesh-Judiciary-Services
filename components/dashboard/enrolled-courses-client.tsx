"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Layers3,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getCategoryMeta } from "@/lib/types/course";

type EnrolledCourse = {
  course: {
    _id: string;
    title: string;
    slug: string;
    programKind: "course" | "exam";
    description: string;
    coverUrl?: string | null;
    category: "BJS" | "BAR" | "LLB";
    durationLabel: string;
    price: number;
  };
  enrollment: {
    status: "approved" | "pending" | "rejected" | "revoked";
  };
};

const categories = ["all", "BJS", "BAR", "LLB"] as const;

export function EnrolledCoursesClient({
  courses,
}: {
  courses: EnrolledCourse[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";
  const [activeType, setActiveType] = useState<"all" | "course" | "exam">(
    "all"
  );

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.replace(
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
      { scroll: false }
    );
  }

  const categoryFiltered =
    activeCategory === "all"
      ? courses
      : courses.filter((row) => row.course.category === activeCategory);
  const filteredCourses =
    activeType === "all"
      ? categoryFiltered
      : categoryFiltered.filter((row) => row.course.programKind === activeType);
  const approvedCount = courses.filter(
    (row) => row.enrollment.status === "approved"
  ).length;
  const pendingCount = courses.filter(
    (row) => row.enrollment.status === "pending"
  ).length;
  const typeCounts = {
    all: courses.length,
    course: courses.filter((row) => row.course.programKind === "course").length,
    exam: courses.filter((row) => row.course.programKind === "exam").length,
  };
  const grouped = filteredCourses.reduce<Record<string, EnrolledCourse[]>>(
    (accumulator, row) => {
      accumulator[row.course.category] ??= [];
      accumulator[row.course.category].push(row);
      return accumulator;
    },
    {}
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <header className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card px-5 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <BookOpen size={14} aria-hidden="true" />
            Your study space
          </p>
          <h1 className="mt-4 break-words font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            My Learning
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            All your enrolled courses and test batches, together in one place.
            Continue learning or check the status of an enrollment request.
          </p>
        </div>
        <Link
          href="/programs"
          className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-primary-dark sm:w-fit"
        >
          Browse programs
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </header>

      <section
        aria-label="Enrollment summary"
        className="grid gap-3 sm:grid-cols-3 sm:gap-4"
      >
        <SummaryCard
          icon={<Layers3 size={18} />}
          label="Total enrollments"
          value={courses.length}
          detail="Courses and test batches"
        />
        <SummaryCard
          icon={<GraduationCap size={18} />}
          label="Ready to continue"
          value={approvedCount}
          detail="Approved access"
        />
        <SummaryCard
          icon={<Clock3 size={18} />}
          label="Awaiting review"
          value={pendingCount}
          detail="Enrollment requests"
        />
      </section>

      <section
        aria-label="Filter learning"
        className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-base font-semibold text-primary">
              Your library
            </h2>
            <p className="mt-1 text-xs text-muted">
              Showing {filteredCourses.length} of {courses.length} enrollments
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by learning type"
          >
            {(
              [
                ["all", "All learning"],
                ["course", "Courses"],
                ["exam", "Model test batches"],
              ] as const
            ).map(([type, label]) => {
              const active = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveType(type)}
                  className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition ${
                    active
                      ? "border-primary bg-primary text-cream shadow-sm"
                      : "border-border bg-background text-muted hover:border-primary/40 hover:bg-primary/[0.03] hover:text-primary"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? "bg-cream/15 text-cream"
                        : "bg-primary/5 text-primary"
                    }`}
                  >
                    {typeCounts[type]}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            className="flex flex-wrap gap-2 border-t border-border pt-4"
            role="group"
            aria-label="Filter by program"
          >
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(category)}
                  className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition ${
                    active
                      ? "border-accent/40 bg-accent/10 text-primary"
                      : "border-border bg-background text-muted hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {category === "all" ? "All programs" : category}
                  <span className="ml-1 text-[11px] opacity-70">
                    {category === "all"
                      ? courses.length
                      : courses.filter(
                          (row) => row.course.category === category
                        ).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
            <BookOpen aria-hidden="true" size={22} />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-primary">
            {courses.length
              ? `No ${activeType === "exam" ? "model test batches" : activeType === "course" ? "courses" : "learning enrollments"} in this filter`
              : "You haven’t enrolled in a course or model test batch yet"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Browse programs to find a course that fits your preparation plan.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/programs"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              Browse courses
            </Link>
            <Link
              href="/exam-courses"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Browse test batches
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {categories
            .filter(
              (category): category is "BJS" | "BAR" | "LLB" =>
                category !== "all"
            )
            .filter((category) => (grouped[category]?.length ?? 0) > 0)
            .map((category) => {
              const rows = grouped[category];
              const meta = getCategoryMeta(category);
              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-primary">
                      {meta.label}
                    </h2>
                    <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                      {rows.length}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {rows.map(({ course, enrollment }) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        status={enrollment.status}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-primary">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </span>
    </article>
  );
}

function CourseCard({
  course,
  status,
}: {
  course: EnrolledCourse["course"];
  status: EnrolledCourse["enrollment"]["status"];
}) {
  const statusLabel = {
    approved: "Approved",
    pending: "Pending approval",
    rejected: "Access denied",
    revoked: "Access revoked",
  }[status];
  const statusClass = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    rejected: "border-red-200 bg-red-50 text-red-700",
    revoked: "border-border bg-background text-muted",
  }[status];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-primary/5">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top_right,rgba(184,115,51,0.14),transparent_55%),linear-gradient(135deg,rgba(8,65,55,0.05),rgba(8,65,55,0.12))] text-primary/40">
            <BookOpen size={36} strokeWidth={1.5} />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
          {course.programKind === "exam"
            ? `${course.category} · Model test batch`
            : `${course.category} · Course`}
        </p>
        <h3 className="mt-1 line-clamp-2 font-heading text-lg font-semibold leading-snug text-primary">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted">
          {course.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Clock3 size={14} /> {course.durationLabel}
          </span>
          {status === "approved" ? (
            <Link
              href={`/dashboard/courses/${course.slug}`}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              {course.programKind === "exam" ? "Open batch" : "Continue"}
              <ArrowRight size={14} />
            </Link>
          ) : status === "pending" ? (
            <span className="text-sm font-medium text-amber-800">
              Awaiting review
            </span>
          ) : (
            <Link
              href="/programs"
              className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse programs <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
