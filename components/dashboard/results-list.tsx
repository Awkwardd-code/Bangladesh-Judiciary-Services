"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Search,
} from "lucide-react";

import type { RecentAttempt } from "@/lib/stats";

const filters = ["All", "Preliminary", "Written", "Free"] as const;
type ResultFilter = (typeof filters)[number];

export function ResultsList({ results }: { results: RecentAttempt[] }) {
  const [filter, setFilter] = useState<ResultFilter>("All");
  const [search, setSearch] = useState("");
  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return results.filter((result) => {
      const matchesFilter = filter === "All" || result.category === filter;
      const matchesSearch = !query || result.subject.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, results, search]);

  return (
    <section aria-labelledby="results-list-title" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Your history
          </p>
          <h2
            id="results-list-title"
            className="mt-1 font-heading text-xl font-bold text-primary sm:text-2xl"
          >
            Recent attempts
          </h2>
          <p className="mt-1 text-sm text-muted">
            {filteredResults.length}{" "}
            {filteredResults.length === 1 ? "result" : "results"}
            {search || filter !== "All" ? " found" : " to review"}
          </p>
        </div>
        {results.length > 0 ? (
          <label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 sm:max-w-xs">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search results by exam name</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your attempts"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
          </label>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center shadow-sm sm:px-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
            <FileText size={22} aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-heading text-lg font-semibold text-primary">
            Your results will show up here
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            Complete a test to see your score, review your answers, and follow
            your progress over time.
          </p>
          <Link
            href="/dashboard/exams"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-cream transition hover:bg-primary-dark"
          >
            Find a test <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter results by exam type"
          >
            {filters.map((item) => {
              const count =
                item === "All"
                  ? results.length
                  : results.filter((result) => result.category === item).length;
              const active = filter === item;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item)}
                  className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "border-primary bg-primary text-cream"
                      : "border-border bg-card text-muted hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {item === "Free" ? "Free test" : item}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      active ? "bg-cream/15 text-cream" : "bg-primary/5 text-primary"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((result) => (
                <ResultCard
                  key={`${result.category}-${result.id}`}
                  result={result}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
              <p className="font-medium text-primary">No matching attempts</p>
              <p className="mt-1 text-sm text-muted">
                Try another search term or exam type.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ResultCard({ result }: { result: RecentAttempt }) {
  const status = displayStatus(result.status);
  const ungraded = result.category === "Written" && result.status !== "graded";

  return (
    <article className="group rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${categoryTone(result.category)}`}>
            <FileText size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words font-heading text-base font-semibold text-primary sm:text-lg">
                {result.subject}
              </h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${categoryPill(result.category)}`}>
                {result.category === "Free" ? "Free test" : result.category}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} aria-hidden="true" />
                {formatDate(result.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} aria-hidden="true" />
                {result.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} aria-hidden="true" />
                {result.correctCount}/{result.totalQuestions} correct
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:justify-end sm:border-0 sm:pt-0">
          <div className="min-w-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Score
            </p>
            <p className="font-heading text-2xl font-bold tracking-tight text-primary">
              {ungraded ? "Pending" : `${result.scorePercent}%`}
            </p>
          </div>
          <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold ${statusTone(status)}`}>
            {ungraded ? (
              <CircleAlert size={13} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={13} aria-hidden="true" />
            )}
            {status}
          </span>
          <Link
            href={result.href}
            aria-label={`View answers and results for ${result.subject}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/[0.03] sm:w-auto"
          >
            Review answers
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function displayStatus(status: string) {
  if (status === "graded") return "Graded";
  if (status === "under-review") return "Under review";
  if (status === "in-progress") return "In progress";
  if (status === "expired") return "Expired";
  return "Submitted";
}

function categoryTone(category: string) {
  if (category === "Preliminary") return "bg-sky-50 text-sky-700";
  if (category === "Written") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

function categoryPill(category: string) {
  if (category === "Preliminary") return "bg-sky-50 text-sky-700";
  if (category === "Written") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

function statusTone(status: string) {
  if (status === "Graded") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Expired") return "border-red-200 bg-red-50 text-red-700";
  if (status === "Under review") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-border bg-background text-muted";
}
