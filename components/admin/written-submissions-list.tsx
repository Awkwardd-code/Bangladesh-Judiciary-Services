"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { SearchInput } from "@/components/ui/search-input";
import { TableRowsSkeleton } from "@/components/skeletons/table-rows-skeleton";
import { buildQuery } from "@/lib/query-params";

type ExamOption = {
  _id: string;
  title: string;
};

type WrittenSubmissionRow = {
  id: string;
  examId: string;
  userId: string;
  submittedAt: string;
  status: "submitted" | "under-review" | "graded";
  totalScore: number;
  maxScore: number;
  user: { id: string; name: string; email: string } | null;
  exam: { id: string; title: string; totalMarks: number } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function WrittenSubmissionsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [submissions, setSubmissions] = useState<WrittenSubmissionRow[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const examId = searchParams.get("examId") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";
  const pendingOnly = searchParams.get("pendingOnly") === "true";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        const response = await fetch("/api/admin/written-exams?limit=100");
        const result = (await response.json()) as {
          data?: { exams?: ExamOption[] };
        };

        if (active && response.ok) {
          setExams(result.data?.exams ?? []);
        }
      } catch {
        if (active) {
          setExams([]);
        }
      }
    }

    void loadExams();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    params.set("limit", "20");

    async function loadSubmissions() {
      try {
        const response = await fetch(
          `/api/admin/written-submissions?${params}`,
          { signal: controller.signal }
        );
        const result = (await response.json()) as {
          error?: string;
          data?: {
            submissions?: WrittenSubmissionRow[];
            pagination?: Pagination;
          };
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load submissions.");
        }

        if (active) {
          setSubmissions(result.data?.submissions ?? []);
          setPagination(result.data?.pagination ?? emptyPagination);
        }
      } catch (caughtError) {
        if (
          !active ||
          (caughtError instanceof DOMException &&
            caughtError.name === "AbortError")
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load submissions."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSubmissions();

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, query]);

  function updateFilter(key: string, value: string | number | boolean) {
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, { [key]: value });
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function changePage(nextPage: number) {
    updateFilter("page", nextPage);
  }

  function formatDate(value: string) {
    const elapsedSeconds = (Date.now() - new Date(value).getTime()) / 1000;
    const relativeTime = new Intl.RelativeTimeFormat(undefined, {
      numeric: "auto",
    });
    const intervals: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 31_536_000],
      ["month", 2_592_000],
      ["day", 86_400],
      ["hour", 3_600],
      ["minute", 60],
    ];

    for (const [unit, seconds] of intervals) {
      if (Math.abs(elapsedSeconds) >= seconds) {
        return relativeTime.format(-Math.round(elapsedSeconds / seconds), unit);
      }
    }

    return relativeTime.format(0, "second");
  }

  return (
    <div className="mt-6">
      <FilterBar
        showClear={Boolean(
          search || examId !== "all" || status !== "all" || pendingOnly
        )}
        onClear={() => router.replace(pathname, { scroll: false })}
      >
        <SearchInput
          value={search}
          onChange={(value) => updateFilter("search", value)}
          placeholder="Search student name or email"
          className="sm:max-w-80"
        />
        <FilterSelect
          value={examId}
          onValueChange={(value) => updateFilter("examId", value)}
          placeholder="All written exams"
          aria-label="Filter by written exam"
          options={exams.map((exam) => ({
            value: exam._id,
            label: exam.title,
          }))}
        />
        <FilterSelect
          value={status}
          onValueChange={(value) => updateFilter("status", value)}
          placeholder="All statuses"
          aria-label="Filter by submission status"
          options={[
            { value: "submitted", label: "Submitted" },
            { value: "under-review", label: "Under review" },
            { value: "graded", label: "Graded" },
          ]}
        />
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-primary">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(event) =>
              updateFilter("pendingOnly", event.target.checked)
            }
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          Pending review
        </label>
      </FilterBar>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <TableRowsSkeleton rows={8} columns={6} />
        ) : submissions.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No written submissions found.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Exam</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-5 py-3">
                        <span className="block font-medium text-primary">
                          {submission.user?.name ?? "Unknown student"}
                        </span>
                        <span className="block text-xs text-muted">
                          {submission.user?.email ?? ""}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {submission.exam?.title ?? "Unknown exam"}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="text-muted">
                          {submission.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {submission.status === "graded"
                          ? `${submission.totalScore} / ${submission.maxScore}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/written-submissions/${submission.id}`}
                          className="cursor-pointer text-sm font-medium text-accent hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {submissions.map((submission) => (
                <article key={submission.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">
                        {submission.user?.name ?? "Unknown student"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {submission.user?.email ?? ""}
                      </p>
                    </div>
                    <Badge className="shrink-0 text-muted">
                      {submission.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-foreground">
                    {submission.exam?.title ?? "Unknown exam"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>{formatDate(submission.submittedAt)}</span>
                    <span>
                      {submission.status === "graded"
                        ? `${submission.totalScore} / ${submission.maxScore}`
                        : "—"}
                    </span>
                  </div>
                  <Link
                    href={`/admin/written-submissions/${submission.id}`}
                    className="mt-3 inline-flex min-h-9 cursor-pointer items-center text-sm font-medium text-accent"
                  >
                    Review
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={changePage}
        />
      </div>
    </div>
  );
}
