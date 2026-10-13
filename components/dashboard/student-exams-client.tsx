"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";

import { ActiveExamBanner } from "@/components/dashboard/active-exam-banner";
import type { ActiveExam } from "@/lib/types/exam";

export type StudentExam = {
  id: string;
  kind: "preliminary" | "written";
  status: "published";
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt: number;
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

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="relative isolate flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <ShieldCheck size={15} />
            Course assessment
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
            Tests in your courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Take the preliminary and written tests included in your courses and
            enrolled model test batches.
          </p>
        </div>
        <Link
          href="/exam-courses"
          className="group inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-border bg-background px-4 text-sm font-semibold text-primary hover:border-primary/30 hover:bg-primary/5 sm:self-auto"
        >
          Browse model test batches
          <ArrowRight size={15} />
        </Link>
      </header>

      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Free exam attempts
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-primary">
              {quota.remaining} of {quota.limit} remaining
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">
            {quota.used} of {quota.limit} free attempts used
          </p>
          <p className="text-sm text-muted">{quota.used} used</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
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

      {activeExam ? (
        <div className="mt-5">
          <ActiveExamBanner
            active={activeExam}
            examTitle="Continue your active exam."
          />
        </div>
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3">
          <Search className="h-4 w-4 text-muted" />
          <span className="sr-only">Search exams</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exams"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <label className="sr-only" htmlFor="exam-kind-filter">
          Filter by exam kind
        </label>
        <select
          id="exam-kind-filter"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
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
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="all">All categories</option>
          <option value="BJS">BJS</option>
          <option value="BAR">BAR</option>
          <option value="LLB">LLB</option>
        </select>
      </div>

      {filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <h2 className="font-heading text-xl font-semibold text-primary">
            No exams available.
          </h2>
          <p className="mt-2 text-sm text-muted">
            {exams.length > 0
              ? "Try changing your search or filters."
              : "Published course exams will appear here."}
          </p>
        </div>
      ) : (
        <section className="space-y-5">
          {courseGroups.map(({ course, exams: courseExams }, courseIndex) => (
            <details
              key={course.courseId}
              open={courseIndex === 0}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 p-4 hover:bg-primary/[0.02] sm:flex-row sm:items-center sm:p-5 [&::-webkit-details-marker]:hidden">
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
                  <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary/50 sm:w-32">
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
                <span className="hidden text-xs text-muted sm:block">
                  <span className="group-open:hidden">Show tests</span>
                  <span className="hidden group-open:inline">Hide tests</span>
                </span>
              </summary>

              <div className="divide-y divide-border border-t border-border">
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

                  return (
                    <div
                      key={exam.id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <FileText aria-hidden="true" size={17} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-primary">
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
                            {exam.attempt?.bestScore !== null &&
                            exam.attempt?.bestScore !== undefined ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 aria-hidden="true" size={13} />
                                Best: {exam.attempt.bestScore}%
                              </span>
                            ) : (
                              <span>Not attempted yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {exam.totalQuestions === 0 ? (
                        <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/10 px-4 text-sm text-muted">
                          Questions being added
                        </span>
                      ) : canStart ? (
                        <Link
                          href={`/exam/${exam.id}`}
                          className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-cream hover:bg-primary-dark"
                        >
                          {actionLabel}
                          <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                      ) : (
                        <span className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-muted/10 px-4 text-sm text-muted">
                          <Lock aria-hidden="true" size={15} />
                          {actionLabel}
                        </span>
                      )}
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
