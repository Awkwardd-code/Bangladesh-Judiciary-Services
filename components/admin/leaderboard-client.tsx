"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Medal,
  Trophy,
  X,
  Crown,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  CalendarDays,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LeaderboardAnswerReview } from "@/components/admin/leaderboard-answer-review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkLine,
} from "@/components/skeletons/primitives";
import type {
  LeaderboardExamOption,
  LeaderboardRow,
} from "@/lib/leaderboard-query";

type ReviewingAttempt = { row: LeaderboardRow };

function formatScore(row: LeaderboardRow) {
  return row.totalMarks > 0 ? `${row.score} / ${row.totalMarks}` : `${row.score}`;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function accuracyTone(v: number) {
  if (v >= 70) return "text-emerald-700";
  return v >= 50 ? "text-amber-700" : "text-red-700";
}

function accuracyBarTone(v: number) {
  if (v >= 70) return "bg-emerald-500";
  return v >= 50 ? "bg-amber-500" : "bg-red-500";
}

function rankVisual(rank: number) {
  if (rank === 1)
    return {
      wrap: "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 ring-1 ring-amber-200/70",
      icon: <Trophy aria-hidden="true" size={17} />,
      stripe: "bg-amber-400",
      rowTint: "bg-amber-50/30",
    };
  if (rank === 2)
    return {
      wrap: "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 ring-1 ring-slate-200",
      icon: <Medal aria-hidden="true" size={17} />,
      stripe: "bg-slate-400",
      rowTint: "bg-slate-50/40",
    };
  if (rank === 3)
    return {
      wrap: "bg-gradient-to-br from-orange-100 to-amber-50 text-amber-800 ring-1 ring-orange-200",
      icon: <Medal aria-hidden="true" size={17} />,
      stripe: "bg-orange-400",
      rowTint: "bg-orange-50/30",
    };
  return {
    wrap: "bg-muted/[0.06] text-primary ring-1 ring-border",
    icon: <span className="font-heading text-sm font-bold">{rank}</span>,
    stripe: null,
    rowTint: "",
  };
}

const KIND_LABEL: Record<string, string> = {
  preliminary: "Preliminary",
  written: "Written",
  free: "Free test",
};

export function LeaderboardClient({
  initialRows,
  examOptions,
}: {
  initialRows: LeaderboardRow[];
  examOptions: LeaderboardExamOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<ReviewingAttempt | null>(null);
  const search = searchParams.get("search") ?? "";
  const examKind = searchParams.get("examKind") ?? "all";
  const examId = searchParams.get("examId") ?? "all";
  const availableExams = useMemo(
    () => examOptions.filter((e) => examKind === "all" || e.kind === examKind),
    [examKind, examOptions]
  );
  const hasFilters = Boolean(search) || examKind !== "all" || examId !== "all";
  const activeFilterCount =
    (search ? 1 : 0) + (examKind !== "all" ? 1 : 0) + (examId !== "all" ? 1 : 0);
  const selectedExam = availableExams.find((e) => e.id === examId) ?? null;

  useEffect(() => {
    if (!reviewing) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setReviewing(null);
    }
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEsc);
    };
  }, [reviewing]);

  useEffect(() => {
    if (!query) {
      setRows(initialRows);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/leaderboard${query ? `?${query}` : ""}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error(
            `Leaderboard request returned an unexpected response (HTTP ${response.status}).`
          );
        }

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load the leaderboard.");
        }

        if (!Array.isArray(result.data?.rows)) {
          throw new Error("The leaderboard response did not include results.");
        }

        setRows(result.data.rows);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load the leaderboard."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [initialRows, query]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    if (key === "examKind") params.delete("examId");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  function clearOne(key: "search" | "examKind" | "examId") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "examKind") params.delete("examId");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  const topRows = rows.slice(0, 3);
  const podiumOrder = [
    topRows.find((r) => r.rank === 2),
    topRows.find((r) => r.rank === 1),
    topRows.find((r) => r.rank === 3),
  ].filter((r): r is LeaderboardRow => Boolean(r));

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy aria-hidden="true" size={20} />
            </span>
            <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
              Leaderboard
            </h1>
          </div>
          <p className="mt-2 text-base text-muted">
            Top scorers across every model test. Click any student to review
            their answers.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted sm:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {rows.length} {rows.length === 1 ? "attempt" : "attempts"}
          </span>
        </div>
      </header>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/[0.04] px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              aria-hidden="true"
              size={15}
              className="text-muted"
            />
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Filters
            </h2>
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-muted/10 hover:text-primary"
            >
              <RotateCcw aria-hidden="true" size={12} />
              Reset all
            </button>
          ) : (
            <span className="hidden text-xs text-muted sm:inline">
              Narrow the list by student or exam
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <label
                htmlFor="leaderboard-search"
                className="block text-xs font-semibold text-primary"
              >
                Find a student
              </label>
              <SearchInput
                id="leaderboard-search"
                value={search}
                onChange={(v) => updateFilter("search", v)}
                placeholder="Name, email, or roll number"
                className="w-full"
              />
            </div>

            {/* Exam type */}
            <div className="space-y-2">
              <label
                htmlFor="leaderboard-kind-filter"
                className="block text-xs font-semibold text-primary"
              >
                Exam type
              </label>
              <FilterSelect
                id="leaderboard-kind-filter"
                value={examKind}
                onValueChange={(v) => updateFilter("examKind", v)}
                aria-label="Filter by exam kind"
                placeholder="All types"
                className="w-full cursor-pointer"
                options={[
                  { value: "preliminary", label: "Preliminary" },
                  { value: "written", label: "Written" },
                  { value: "free", label: "Free test" },
                ]}
              />
            </div>

            {/* Specific exam */}
            <div className="space-y-2">
              <label
                htmlFor="leaderboard-exam-filter"
                className="block text-xs font-semibold text-primary"
              >
                Specific exam
                {examKind !== "all" ? (
                  <span className="ml-1 font-normal text-muted">
                    (filtered by {KIND_LABEL[examKind] ?? examKind})
                  </span>
                ) : null}
              </label>
              <FilterSelect
                id="leaderboard-exam-filter"
                value={examId}
                onValueChange={(v) => updateFilter("examId", v)}
                aria-label="Filter by exam"
                placeholder="All exams"
                className="w-full cursor-pointer"
                options={availableExams.map((e) => ({
                  value: e.id,
                  label: `${e.title} (${e.kind})`,
                }))}
              />
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Active
              </span>

              {search ? (
                <FilterChip
                  label={`Search: "${search}"`}
                  onClear={() => clearOne("search")}
                />
              ) : null}

              {examKind !== "all" ? (
                <FilterChip
                  label={`Type: ${KIND_LABEL[examKind] ?? examKind}`}
                  onClear={() => clearOne("examKind")}
                />
              ) : null}

              {examId !== "all" && selectedExam ? (
                <FilterChip
                  label={`Exam: ${selectedExam.title}`}
                  onClear={() => clearOne("examId")}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      {/* ── Podium ─────────────────────────────────────────────────── */}
      {!hasFilters && podiumOrder.length > 0 ? (
        <Card className="relative overflow-hidden border-primary bg-gradient-to-b from-primary to-primary/90 p-6 text-cream sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(600px 200px at 50% 0%, rgba(255,255,255,0.15), transparent 70%)",
            }}
          />
          <div className="relative mx-auto grid max-w-3xl grid-cols-3 items-end gap-2 sm:gap-4">
            {podiumOrder.map((row) => {
              const first = row.rank === 1;
              return (
                <button
                  key={`${row.examKind}:${row.attemptId}`}
                  type="button"
                  onClick={() => setReviewing({ row })}
                  className={`
                    group relative flex cursor-pointer flex-col items-center
                    rounded-2xl border border-cream/15 bg-cream/[0.06] px-2
                    text-center transition-all duration-200
                    hover:-translate-y-0.5 hover:border-cream/30 hover:bg-cream/10
                    sm:px-4
                    ${first ? "min-h-56 py-6" : "min-h-44 py-5"}
                  `}
                >
                  {first ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow">
                      <Crown
                        aria-hidden="true"
                        size={12}
                        className="mr-1 inline -mt-0.5"
                      />
                      Champion
                    </span>
                  ) : null}
                  <div className="relative">
                    <LeaderboardAvatar
                      url={row.userAvatarUrl}
                      name={row.userName}
                      size={first ? 64 : 48}
                      className={`border-2 bg-accent text-white ${
                        first
                          ? "border-amber-400/60 ring-4 ring-amber-400/20"
                          : "border-cream/30"
                      }`}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${
                        row.rank === 1
                          ? "bg-amber-400 text-amber-950"
                          : row.rank === 2
                            ? "bg-gray-200 text-gray-700"
                            : "bg-amber-700 text-amber-50"
                      }`}
                    >
                      {row.rank}
                    </span>
                  </div>
                  <span className="mt-4 max-w-full truncate text-sm font-semibold">
                    {row.userName}
                  </span>
                  <span className="mt-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                    {formatScore(row)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* ── Table ──────────────────────────────────────────────────── */}
      <Card className="overflow-hidden" aria-busy={loading}>
        {error ? (
          <p role="alert" className="px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <LeaderboardRowsSkeleton />
        ) : rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
              {hasFilters ? (
                <Search aria-hidden="true" className="text-muted" size={28} />
              ) : (
                <Trophy aria-hidden="true" className="text-muted" size={28} />
              )}
            </span>
            <h2 className="mt-4 font-heading text-lg font-semibold text-primary">
              {hasFilters ? "No matching attempts." : "No attempts yet."}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {hasFilters
                ? "Try adjusting your filters or search query."
                : "Attempts will appear here once students submit exams."}
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] table-fixed border-collapse text-left">
              <colgroup>
                <col style={{ width: 76 }} />
                <col style={{ width: 300 }} />
                <col style={{ width: 260 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 140 }} />
              </colgroup>

              <thead>
                <tr className="border-b border-border bg-muted/[0.04]">
                  {[
                    "Rank",
                    "Student",
                    "Exam",
                    "Score",
                    "Accuracy",
                    "Breakdown",
                    "Submitted",
                    "Action",
                  ].map((label, i, arr) => (
                    <th
                      key={label}
                      className={`px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted ${
                        i === arr.length - 1 ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const rank = rankVisual(row.rank);
                  return (
                    <tr
                      key={`${row.examKind}:${row.attemptId}`}
                      tabIndex={0}
                      aria-label={`Review answers for ${row.userName}`}
                      onClick={() => setReviewing({ row })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setReviewing({ row });
                        }
                      }}
                      className={`
                        group relative cursor-pointer outline-none
                        transition-colors duration-150
                        hover:bg-primary/[0.035] focus:bg-primary/[0.035]
                        ${rank.rowTint}
                      `}
                    >
                      {/* Rank */}
                      <td className="relative px-4 py-4">
                        {rank.stripe ? (
                          <span
                            aria-hidden="true"
                            className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${rank.stripe}`}
                          />
                        ) : null}
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${rank.wrap}`}
                        >
                          {rank.icon}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <LeaderboardAvatar
                            url={row.userAvatarUrl}
                            name={row.userName}
                            size={40}
                            className="bg-primary/10 text-xs font-semibold text-primary ring-1 ring-border"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary">
                              {row.userName}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {row.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Exam */}
                      <td className="px-4 py-4">
                        <p
                          className="truncate text-sm font-medium text-primary"
                          title={row.examTitle}
                        >
                          {row.examTitle}
                        </p>
                        <Badge className="mt-1.5 inline-flex capitalize text-[10px]">
                          {row.examKind}
                        </Badge>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-baseline gap-0.5 tabular-nums">
                          <span className="font-heading text-base font-bold leading-none text-primary">
                            {row.score}
                          </span>
                          {row.totalMarks > 0 ? (
                            <span className="text-xs font-medium leading-none text-muted">
                              /{row.totalMarks}
                            </span>
                          ) : null}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <span
                            className={`block text-sm font-semibold tabular-nums ${accuracyTone(
                              row.accuracyPercent
                            )}`}
                          >
                            {row.accuracyPercent.toFixed(1)}%
                          </span>
                          <div className="h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-muted/10">
                            <div
                              className={`h-full rounded-full transition-[width] duration-300 ${accuracyBarTone(
                                row.accuracyPercent
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, row.accuracyPercent)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Breakdown */}
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center divide-x divide-border overflow-hidden rounded-lg ring-1 ring-border">
                          <span
                            className="inline-flex items-center gap-1 bg-emerald-50/70 px-2 py-1 text-[11px] font-semibold tabular-nums text-emerald-800"
                            title="Correct"
                          >
                            <CheckCircle2 aria-hidden="true" size={12} />
                            {row.correctCount}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 bg-red-50/70 px-2 py-1 text-[11px] font-semibold tabular-nums text-red-800"
                            title="Wrong"
                          >
                            <XCircle aria-hidden="true" size={12} />
                            {row.wrongCount}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 bg-muted/[0.04] px-2 py-1 text-[11px] font-semibold tabular-nums text-muted"
                            title="Skipped"
                          >
                            <MinusCircle aria-hidden="true" size={12} />
                            {row.skippedCount}
                          </span>
                        </div>
                      </td>

                      {/* Submitted */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays
                            aria-hidden="true"
                            size={13}
                            className="shrink-0"
                          />
                          {formatSubmittedAt(row.submittedAt)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-right">
                        <Button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setReviewing({ row });
                          }}
                          className="
                            inline-flex h-8 items-center justify-center gap-1.5
                            rounded-full bg-primary px-3 text-xs font-semibold
                            text-cream shadow-sm transition-all
                            hover:bg-primary/90 hover:shadow
                            focus-visible:ring-2 focus-visible:ring-accent
                            focus-visible:ring-offset-1
                          "
                        >
                          <Eye aria-hidden="true" size={14} />
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Review modal ───────────────────────────────────────────── */}
      {reviewing ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/50 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReviewing(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="leaderboard-review-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background text-primary shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-muted/5 px-5 py-4 sm:px-7">
              <div className="flex min-w-0 items-start gap-4">
                <LeaderboardAvatar
                  url={reviewing.row.userAvatarUrl}
                  name={reviewing.row.userName}
                  size={48}
                  className="mt-0.5 hidden bg-primary/10 text-sm font-semibold text-primary ring-1 ring-border sm:flex"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    Attempt answer review
                  </p>
                  <h2
                    id="leaderboard-review-title"
                    className="mt-1 truncate font-heading text-xl font-bold sm:text-2xl"
                  >
                    {reviewing.row.userName}
                  </h2>
                  <p className="mt-1 truncate text-sm text-muted">
                    {reviewing.row.examTitle} ·{" "}
                    {formatSubmittedAt(reviewing.row.submittedAt)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                aria-label="Close answer review"
                onClick={() => setReviewing(null)}
                className="size-10 shrink-0 rounded-full p-0"
              >
                <X aria-hidden="true" size={19} />
              </Button>
            </header>

            <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryItem
                  icon={<Trophy aria-hidden="true" size={14} />}
                  label="Score"
                  value={formatScore(reviewing.row)}
                  tone="primary"
                />
                <SummaryItem
                  icon={<Target aria-hidden="true" size={14} />}
                  label="Accuracy"
                  value={`${reviewing.row.accuracyPercent.toFixed(1)}%`}
                  tone="emerald"
                />
                <SummaryItem
                  icon={<CheckCircle2 aria-hidden="true" size={14} />}
                  label="Correct"
                  value={String(reviewing.row.correctCount)}
                  tone="emerald"
                />
                <SummaryItem
                  icon={<XCircle aria-hidden="true" size={14} />}
                  label="Wrong / skipped"
                  value={`${reviewing.row.wrongCount} / ${reviewing.row.skippedCount}`}
                  tone="red"
                />
              </div>

              {reviewing.row.passMarkPercent != null ? (
                <Badge
                  className={
                    reviewing.row.totalMarks > 0 &&
                    (reviewing.row.score / reviewing.row.totalMarks) * 100 >=
                      reviewing.row.passMarkPercent
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }
                >
                  {reviewing.row.totalMarks > 0 &&
                  (reviewing.row.score / reviewing.row.totalMarks) * 100 >=
                    reviewing.row.passMarkPercent
                    ? "Passed"
                    : "Did not pass"}
                </Badge>
              ) : null}

              <div>
                <h3 className="mb-3 font-heading text-lg font-bold text-primary">
                  Attempt answers
                </h3>
                <LeaderboardAnswerReview
                  key={`${reviewing.row.source}:${reviewing.row.attemptId}`}
                  attemptId={reviewing.row.attemptId}
                  kind={reviewing.row.examKind}
                  source={reviewing.row.source}
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

/* ── Filter chip ─────────────────────────────────────────────────── */
function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card py-1 pl-2.5 pr-1 text-xs font-medium text-primary">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter: ${label}`}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/10 hover:text-primary"
      >
        <X aria-hidden="true" size={12} />
      </button>
    </span>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────── */
function LeaderboardRowsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading leaderboard results"
      className="divide-y divide-border"
    >
      <span className="sr-only">Loading leaderboard results…</span>
      <div className="hidden grid-cols-8 gap-4 border-b border-border bg-muted/[0.04] px-4 py-3.5 md:grid">
        {Array.from({ length: 8 }, (_, i) => (
          <SkLine key={i} width="w-20" />
        ))}
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-2 gap-4 px-4 py-4 md:grid-cols-8 md:items-center"
        >
          <div className="flex items-center gap-3">
            <SkCircle size="h-9 w-9" />
            <div className="space-y-2">
              <SkLine width="w-24" />
              <SkLine width="w-16" height="h-2" />
            </div>
          </div>
          <div className="space-y-2 md:col-span-1">
            <SkLine width="w-32" />
            <SkBadge />
          </div>
          <SkLine width="w-20" />
          <SkLine width="w-12" />
          <div className="flex gap-1">
            <SkBadge width="w-10" />
            <SkBadge width="w-10" />
            <SkBadge width="w-10" />
          </div>
          <SkLine width="w-24" />
          <SkButton width="w-28" />
        </div>
      ))}
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────── */
function LeaderboardAvatar({
  url,
  name,
  size,
  className,
}: {
  url: string;
  name: string;
  size: number;
  className: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [url]);
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {imageFailed ? (
        <Image
          src="/avatars/default.svg"
          alt={`${name}'s profile picture`}
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={url}
          alt={`${name}'s profile picture`}
          width={size}
          height={size}
          unoptimized
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}

/* ── Summary item ────────────────────────────────────────────────── */
function SummaryItem({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "primary" | "emerald" | "red";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }[tone];
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md ${toneClasses}`}
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-muted">{label}</p>
      </div>
      <p className="mt-2 truncate font-heading text-lg font-bold text-primary">
        {value}
      </p>
    </Card>
  );
}