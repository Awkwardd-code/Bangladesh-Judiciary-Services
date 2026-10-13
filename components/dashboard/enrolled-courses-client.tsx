"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
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
  const grouped = filteredCourses.reduce<Record<string, EnrolledCourse[]>>(
    (accumulator, row) => {
      accumulator[row.course.category] ??= [];
      accumulator[row.course.category].push(row);
      return accumulator;
    },
    {}
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-24 -z-10 size-56 rounded-full bg-accent/10 blur-3xl"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Your learning space
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
            My Learning
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Find your courses and model test batches, and check enrollment
            status.
          </p>
        </div>
        <p className="mt-4 inline-flex w-fit rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted sm:mt-0">
          {courses.length} {courses.length === 1 ? "enrollment" : "enrollments"}
        </p>
      </header>

      <nav
        aria-label="Filter learning by type and category"
        className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-wrap gap-2">
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
                    : "border-border bg-background text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
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
                    ? "border-accent bg-accent/10 text-primary"
                    : "border-border bg-card text-muted hover:border-primary/40"
                }`}
              >
                {category === "all" ? "All programs" : category}
              </button>
            );
          })}
        </div>
      </nav>

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
          <Link
            href="/programs"
            className="mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-medium text-cream hover:bg-primary-dark"
          >
            Browse programs
          </Link>
          <Link
            href="/exam-courses"
            className="mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-primary hover:bg-primary/5 sm:ml-2"
          >
            Browse model test batches
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, rows]) => {
            const meta = getCategoryMeta(category as "BJS" | "BAR" | "LLB");
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
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
    approved: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-800",
    rejected: "bg-red-50 text-red-700",
    revoked: "bg-muted/10 text-muted",
  }[status];

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
          <div className="flex h-full items-center justify-center text-primary/30">
            <BookOpen size={34} />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
          {course.programKind === "exam"
            ? `${course.category} · Model test batch`
            : `${course.category} · Course`}
        </p>
        <h3 className="mt-1 line-clamp-2 font-heading text-lg font-semibold text-primary">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Clock3 size={14} /> {course.durationLabel}
          </span>
          {status === "approved" ? (
            <Link
              href={`/dashboard/courses/${course.slug}`}
              className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-primary px-4 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              {course.programKind === "exam" ? "Open batch" : "Continue"}
            </Link>
          ) : status === "pending" ? (
            <span className="text-sm font-medium text-amber-800">
              Awaiting review
            </span>
          ) : (
            <Link
              href="/programs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Browse programs
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
