"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Lock,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";

import { ActiveExamBanner } from "@/components/dashboard/active-exam-banner";
import type { ActiveExam } from "@/lib/types/exam";

export type StudentExam = {
  id: string;
  source: "unified" | "preliminary" | "written";
  href: string;
  kind: "preliminary" | "written";
  status: "published";
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt: number;
  isLocked: boolean;
  isFree: boolean;
  price: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseCategory: "BJS" | "BAR" | "LLB";
  segmentTitle: string;
  subSegmentTitle: string;
  scheduledAt: string | null;
  closesAt: string | null;
  attempt: { attempts: number; bestScore: number | null } | null;
  enrollment: "approved" | "pending" | "rejected" | "none";
};

export function StudentExamsClient({
  exams,
  activeExam,
  quota,
}: {
  exams: StudentExam[];
  activeExam: ActiveExam;
  quota: { used: number; limit: number; remaining: number };
}) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [category, setCategory] = useState("all");

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        `${exam.title} ${exam.description} ${exam.courseTitle} ${exam.segmentTitle} ${exam.subSegmentTitle}`
          .toLowerCase()
          .includes(query);
      const matchesKind = kind === "all" || exam.kind === kind;
      const matchesCategory =
        category === "all" || exam.courseCategory === category;

      return matchesSearch && matchesKind && matchesCategory;
    });
  }, [category, exams, kind, search]);

  const courseGroups = useMemo(() => {
    const groups = new Map<
      string,
      { course: StudentExam; exams: StudentExam[] }
    >();

    for (const exam of filteredExams) {
      const group = groups.get(exam.courseId);
      if (group) {
        group.exams.push(exam);
      } else {
        groups.set(exam.courseId, { course: exam, exams: [exam] });
      }
    }

    return [...groups.values()];
  }, [filteredExams]);
  const courseCount = new Set(exams.map((exam) => exam.courseId)).size;
  const attemptedCount = exams.filter(
    (exam) => (exam.attempt?.attempts ?? 0) > 0
  ).length;
  const hasFilters = Boolean(search || kind !== "all" || category !== "all");
  const clearFilters = () => {
    setSearch("");
    setKind("all");
    setCategory("all");
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <header className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card px-5 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <ShieldCheck size={14} aria-hidden="true" />
            Practice center
          </p>
          <h1 className="mt-4 break-words font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Take a Test
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Choose an assessment from your courses and enrolled test batches.
            Your previous scores and access status are shown alongside each test.
          </p>
        </div>
        <Link
          href="/exam-courses"
          className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-primary-dark sm:w-fit"
        >
          Browse test batches
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </header>

      <section aria-label="Test overview" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <OverviewCard
          icon={<FileText size={18} />}
          label="Available tests"
          value={exams.length}
          detail={`${courseCount} ${courseCount === 1 ? "course or batch" : "courses and batches"}`}
        />
        <OverviewCard
          icon={<BookOpenCheck size={18} />}
          label="Tests attempted"
          value={attemptedCount}
          detail="Assessments with a submitted attempt"
        />
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">Free attempts</p>
              <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-primary">
                {quota.remaining}{" "}
                <span className="text-base font-medium text-muted">
                  / {quota.limit} left
                </span>
              </p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Target size={18} />
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {quota.used} free attempts used
          </p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10"
            role="progressbar"
            aria-label="Free exam attempts used"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, quota.limit)}
            aria-valuenow={Math.min(
              Math.max(0, quota.used),
              Math.max(0, quota.limit)
            )}
            aria-valuetext={`${quota.used} of ${quota.limit} attempts used`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-[width] duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((quota.used / Math.max(quota.limit, 1)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      {activeExam ? (
        <div className="mt-5">
          <ActiveExamBanner
            active={activeExam}
            examTitle="Continue your active exam."
          />
        </div>
      ) : null}

      <section
        aria-label="Find a test"
        className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-primary">
              Find an assessment
            </h2>
            <p className="mt-1 text-xs text-muted">
              Showing {filteredExams.length} of {exams.length} tests
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-9 rounded-full border border-border px-3 text-xs font-semibold text-primary hover:border-primary/40 hover:bg-primary/5"
            >
              Clear filters
            </button>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted" />
            <span className="sr-only">Search exams</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exams"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
            />
          </label>
          <label className="sr-only" htmlFor="exam-kind-filter">
            Filter by exam kind
          </label>
          <select
            id="exam-kind-filter"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="all">All exam kinds</option>
            <option value="preliminary">Preliminary</option>
            <option value="written">Written</option>
          </select>
          <label className="sr-only" htmlFor="exam-category-filter">
            Filter by course category
          </label>
          <select
            id="exam-category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="all">All categories</option>
            <option value="BJS">BJS</option>
            <option value="BAR">BAR</option>
            <option value="LLB">LLB</option>
          </select>
        </div>
      </section>

      {filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary">
            {hasFilters ? (
              <Search aria-hidden="true" size={21} />
            ) : (
              <FileText aria-hidden="true" size={21} />
            )}
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold text-primary">
            {hasFilters ? "No matching tests" : "No tests available yet"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {exams.length > 0
              ? "Try changing your search or filters."
              : "Published course exams will appear here."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/exam-courses"
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              Explore test batches <ArrowRight size={15} />
            </Link>
          )}
        </div>
      ) : (
        <section aria-label="Tests grouped by course" className="space-y-4">
          {courseGroups.map(({ course, exams: courseExams }, courseIndex) => (
            <details
              key={course.courseId}
              open={courseIndex === 0}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 p-4 transition-colors hover:bg-primary/[0.02] sm:flex-row sm:items-center sm:p-5 [&::-webkit-details-marker]:hidden">
                {course.thumbnailUrl ? (
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-primary/5 sm:w-32">
                    <Image
                      src={course.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div                   className="flex h-20 w-full shrink-0 items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_top_right,rgba(184,115,51,0.14),transparent_55%),linear-gradient(135deg,rgba(8,65,55,0.05),rgba(8,65,55,0.12))] text-primary/50 sm:w-32">
                    <BookOpen aria-hidden="true" size={28} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    {course.courseCategory} ·{" "}
                    {course.isFree ? "Free course" : "Paid course"}
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-semibold text-primary">
                    {course.courseTitle}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {course.description}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                  <FileText aria-hidden="true" size={14} />
                  {courseExams.length}{" "}
                  {courseExams.length === 1 ? "test" : "tests"}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                  <span className="group-open:hidden">Show tests</span>
                  <span className="hidden group-open:inline">Hide tests</span>
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                </span>
              </summary>

              <div className="space-y-3 border-t border-border bg-background/40 p-3 sm:p-4">
                {courseExams.map((exam) => {
                  const accessState = exam.isFree
                    ? "approved"
                    : exam.enrollment !== "none"
                      ? exam.enrollment
                      : quota.remaining > 0
                        ? "quota-available"
                        : "quota-exhausted";
                  const canStart =
                    accessState === "approved" ||
                    accessState === "quota-available";
                  const actionLabel = exam.isFree
                    ? "Start test"
                    : accessState === "approved"
                      ? "Start test"
                      : accessState === "quota-available"
                        ? "Use free attempt"
                        : accessState === "pending"
                          ? "Awaiting approval"
                          : accessState === "rejected"
                            ? "Access denied"
                            : "Quota exhausted";
                  const accessLabel =
                    exam.isLocked || exam.totalQuestions === 0
                      ? "Preparing test"
                      : accessState === "approved"
                        ? "Included in enrollment"
                        : accessState === "quota-available"
                          ? "Free attempt available"
                          : accessState === "pending"
                            ? "Enrollment pending"
                            : accessState === "rejected"
                              ? "Enrollment declined"
                              : "Enrollment required";
                  const accessTone =
                    exam.isLocked || exam.totalQuestions === 0
                      ? "border-border bg-background text-muted"
                      : accessState === "approved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : accessState === "quota-available"
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : accessState === "pending"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-border bg-background text-muted";

                  return (
                    <div
                      key={exam.id}
                      className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/25 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <FileText aria-hidden="true" size={17} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words font-semibold text-primary">
                              {exam.title}
                            </h3>
                            <span className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                              {exam.kind}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {exam.segmentTitle} · {exam.subSegmentTitle}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                            <span className="inline-flex items-center gap-1">
                              <FileText aria-hidden="true" size={13} />
                              {exam.questionsPerAttempt} questions
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 aria-hidden="true" size={13} />
                              {exam.durationMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Target aria-hidden="true" size={13} />
                              {exam.totalMarks} marks
                            </span>
                            {exam.attempt?.bestScore !== null &&
                            exam.attempt?.bestScore !== undefined ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 aria-hidden="true" size={13} />
                                Best: {exam.attempt.bestScore}%
                              </span>
                            ) : (
                              <span>Not attempted yet</span>
                            )}
                            {exam.scheduledAt ? (
                              <time
                                dateTime={exam.scheduledAt}
                                className="inline-flex items-center gap-1"
                              >
                                <CalendarDays aria-hidden="true" size={13} />
                                Scheduled: {formatExamDate(exam.scheduledAt)}
                              </time>
                            ) : null}
                            {exam.closesAt ? (
                              <time
                                dateTime={exam.closesAt}
                                className="inline-flex items-center gap-1"
                              >
                                <CalendarDays aria-hidden="true" size={13} />
                                Closes: {formatExamDate(exam.closesAt)}
                              </time>
                            ) : null}
                            {(exam.attempt?.attempts ?? 0) > 0 ? (
                              <span>
                                {exam.attempt?.attempts}{" "}
                                {exam.attempt?.attempts === 1
                                  ? "attempt"
                                  : "attempts"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48 sm:items-end">
                        <span
                          className={`inline-flex min-h-7 items-center gap-1.5 self-start rounded-full border px-2.5 text-[11px] font-medium sm:self-end ${accessTone}`}
                        >
                          {accessState === "pending" ||
                          accessState === "rejected" ||
                          accessState === "quota-exhausted" ? (
                            <AlertCircle aria-hidden="true" size={13} />
                          ) : (
                            <CheckCircle2 aria-hidden="true" size={13} />
                          )}
                          {accessLabel}
                        </span>
                        {exam.isLocked || exam.totalQuestions === 0 ? (
                          <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-muted/10 px-4 text-sm text-muted">
                            Questions being added
                          </span>
                        ) : canStart ? (
                          <Link
                            href={exam.href}
                            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-cream hover:bg-primary-dark"
                          >
                            {actionLabel}
                            <ArrowRight aria-hidden="true" size={15} />
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-muted/10 px-4 text-sm text-muted">
                            <Lock aria-hidden="true" size={15} />
                            {actionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}

function formatExamDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function OverviewCard({
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
    <article className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-primary">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
        {icon}
      </span>
    </article>
  );
}
