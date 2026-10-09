"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Medal, Trophy } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LeaderboardAnswerReview } from "@/components/admin/leaderboard-answer-review";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LeaderboardExamOption,
  LeaderboardRow,
} from "@/lib/leaderboard-query";

type ReviewingAttempt = {
  row: LeaderboardRow;
};

function formatScore(row: LeaderboardRow) {
  return row.totalMarks > 0
    ? `${row.score} / ${row.totalMarks}`
    : `${row.score}`;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function accuracyTone(value: number) {
  if (value >= 70) {
    return "text-emerald-700";
  }

  return value >= 50 ? "text-amber-700" : "text-red-700";
}

function rankIcon(rank: number) {
  if (rank === 1) {
    return <Trophy aria-hidden="true" className="text-amber-500" size={19} />;
  }

  if (rank === 2) {
    return <Medal aria-hidden="true" className="text-gray-400" size={19} />;
  }

  if (rank === 3) {
    return <Medal aria-hidden="true" className="text-amber-700" size={19} />;
  }

  return <span className="font-semibold text-primary">{rank}</span>;
}

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
    () =>
      examOptions.filter(
        (exam) => examKind === "all" || exam.kind === examKind
      ),
    [examKind, examOptions]
  );
  const hasFilters = Boolean(search) || examKind !== "all" || examId !== "all";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetch(`/api/admin/leaderboard${query ? `?${query}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load the leaderboard.");
        }

        setRows(result.data.rows ?? []);
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key === "examKind") {
      params.delete("examId");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  const topRows = rows.slice(0, 3);
  const podium = [
    topRows.find((row) => row.rank === 2),
    topRows.find((row) => row.rank === 1),
    topRows.find((row) => row.rank === 3),
  ].filter((row): row is LeaderboardRow => Boolean(row));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-2 text-base text-muted">
          Top scorers across every model test. Click any student to review their
          answers.
        </p>
      </header>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Search name or email"
            className="lg:w-72"
          />
          <FilterSelect
            value={examKind}
            onValueChange={(value) => updateFilter("examKind", value)}
            aria-label="Filter by exam kind"
            placeholder="All kinds"
            className="cursor-pointer lg:w-48"
            options={[
              { value: "preliminary", label: "Preliminary" },
              { value: "written", label: "Written" },
              { value: "free", label: "Free" },
            ]}
          />
          <FilterSelect
            value={examId}
            onValueChange={(value) => updateFilter("examId", value)}
            aria-label="Filter by exam"
            placeholder="All exams"
            className="cursor-pointer lg:min-w-56 lg:flex-1"
            options={availableExams.map((exam) => ({
              value: exam.id,
              label: `${exam.title} (${exam.kind})`,
            }))}
          />
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={clearFilters}
              className="shrink-0"
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      {!hasFilters && podium.length > 0 ? (
        <Card className="overflow-hidden border-primary bg-primary p-6 text-cream">
          <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-3">
            {podium.map((row) => (
              <button
                key={`${row.examKind}:${row.attemptId}`}
                type="button"
                onClick={() => setReviewing({ row })}
                className={`
                  flex cursor-pointer flex-col items-center rounded-lg
                  border border-cream/15 bg-cream/5 px-3 text-center
                  transition-colors hover:bg-cream/10
                  ${row.rank === 1 ? "min-h-48 py-6" : "min-h-40 py-4"}
                `}
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent font-heading font-bold text-white">
                  {initials(row.userName)}
                </span>
                <span className="max-w-full truncate text-sm font-semibold">
                  {row.userName}
                </span>
                <span className="mt-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                  {formatScore(row)}
                </span>
                <span className="mt-2 text-xs text-cream/70">
                  Rank {row.rank}
                </span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        {error ? (
          <p role="alert" className="px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-muted">
            Loading leaderboard…
          </p>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Trophy
              aria-hidden="true"
              className="mx-auto text-muted"
              size={36}
            />
            <h2 className="mt-3 font-heading text-lg font-semibold text-primary">
              No attempts yet.
            </h2>
            <p className="mt-1 text-sm text-muted">
              Attempts will appear here once students submit exams.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="w-16 px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Correct / wrong / skipped</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
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
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-primary/[0.025]"
                  >
                    <td className="px-4 py-4">
                      <span className="flex h-8 w-8 items-center justify-center">
                        {rankIcon(row.rank)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-52 items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(row.userName)}
                        </Avatar>
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
                    <td className="px-4 py-4">
                      <p className="max-w-56 truncate text-sm font-medium text-primary">
                        {row.examTitle}
                      </p>
                      <Badge className="mt-1 capitalize text-[10px]">
                        {row.examKind}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-heading text-base font-bold text-primary">
                        {formatScore(row)}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-4 text-sm font-semibold ${accuracyTone(
                        row.accuracyPercent
                      )}`}
                    >
                      {row.accuracyPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">
                          {row.correctCount}
                        </span>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-red-800">
                          {row.wrongCount}
                        </span>
                        <span className="rounded-full bg-primary/5 px-2 py-1 text-muted">
                          {row.skippedCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {formatSubmittedAt(row.submittedAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          setReviewing({ row });
                        }}
                        className="h-9 rounded-md px-3"
                      >
                        <Eye aria-hidden="true" size={16} />
                        Review answers
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Sheet
        open={Boolean(reviewing)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewing(null);
          }
        }}
      >
        <SheetContent
          side="right"
          aria-label="Answer review"
          className="w-full max-w-2xl overflow-y-auto bg-background p-0 text-primary sm:w-[min(680px,95vw)]"
        >
          {reviewing ? (
            <div className="space-y-5 px-5 pb-8 pt-16 sm:px-7">
              <header>
                <h2 className="font-heading text-2xl font-bold text-primary">
                  {reviewing.row.userName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {reviewing.row.examTitle} ·{" "}
                  {formatSubmittedAt(reviewing.row.submittedAt)}
                </p>
              </header>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryItem label="Score" value={formatScore(reviewing.row)} />
                <SummaryItem
                  label="Accuracy"
                  value={`${reviewing.row.accuracyPercent.toFixed(1)}%`}
                />
                <SummaryItem
                  label="Correct"
                  value={String(reviewing.row.correctCount)}
                />
                <SummaryItem
                  label="Wrong / skipped"
                  value={`${reviewing.row.wrongCount} / ${reviewing.row.skippedCount}`}
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

              <Tabs key={reviewing.row.attemptId} defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2 rounded-md border border-border p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <Card className="mt-4 p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-emerald-600"
                        size={22}
                      />
                      <div>
                        <p className="font-semibold text-primary">
                          Submission received
                        </p>
                        <p className="text-sm text-muted">
                          Submitted{" "}
                          {formatSubmittedAt(reviewing.row.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="questions">
                  <div className="mt-4">
                    <LeaderboardAnswerReview
                      attemptId={reviewing.row.attemptId}
                      kind={reviewing.row.examKind}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate font-heading text-lg font-bold text-primary">
        {value}
      </p>
    </Card>
  );
}
