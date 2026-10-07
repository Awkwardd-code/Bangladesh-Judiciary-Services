"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RecentAttempt } from "@/lib/stats";

export function ResultsList({ results }: { results: RecentAttempt[] }) {
  const [filter, setFilter] = useState<
    "All" | "Preliminary" | "Written" | "Free"
  >("All");
  const filteredResults = useMemo(
    () =>
      filter === "All"
        ? results
        : results.filter((result) => result.category === filter),
    [filter, results],
  );

  if (results.length === 0) {
    return (
      <section className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
        <p className="font-medium text-foreground">No results yet</p>
        <p className="mt-2 text-sm text-muted">
          Your completed tests will appear here.
        </p>
        <Link
          href="/dashboard/mock-exams"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm text-cream"
        >
          Take a test
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-4">
      <div
        role="tablist"
        aria-label="Filter results by exam type"
        className="flex flex-wrap gap-2"
      >
        {(["All", "Preliminary", "Written", "Free"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
              filter === item
                ? "border-primary bg-primary text-cream"
                : "border-border bg-card text-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {filteredResults.map((result) => {
        const status = displayStatus(result.status);
        const ungraded =
          result.category === "Written" &&
          !["graded"].includes(result.status);

        return (
          <Card
            key={`${result.category}-${result.id}`}
            className="border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <Badge className={categoryClass(result.category)}>
                  {result.category === "Free" ? "Free test" : result.category}
                </Badge>
                <h2 className="mt-3 font-heading text-lg font-semibold text-primary">
                  {result.subject}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(result.date).toLocaleDateString("en", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {result.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {result.correctCount}/{result.totalQuestions} correct
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Score
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">
                    {ungraded ? "Pending" : `${result.scorePercent}%`}
                  </p>
                </div>
                <Badge className={statusClass(status)}>{status}</Badge>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href={result.href}
                className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary hover:text-primary"
              >
                View details
              </Link>
            </div>
          </Card>
        );
      })}
      {filteredResults.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted">
          No {filter.toLowerCase()} results yet.
        </p>
      ) : null}
    </section>
  );
}

function displayStatus(status: string) {
  if (status === "graded") return "Graded";
  if (status === "under-review") return "Under review";
  if (status === "in-progress") return "In progress";
  if (status === "expired") return "Expired";
  return "Submitted";
}

function categoryClass(category: string) {
  if (category === "Preliminary") return "border-primary text-primary";
  if (category === "Written") return "border-accent text-accent";
  return "border-emerald-300 text-emerald-700";
}

function statusClass(status: string) {
  if (status === "Graded") return "border-emerald-300 text-emerald-700";
  if (status === "Expired") return "border-red-300 text-red-700";
  return "border-amber-300 text-amber-700";
}
