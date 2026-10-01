"use client";

import Link from "next/link";
import { Clock, FileText, MoreHorizontal, Plus, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  WrittenExamEditor,
  type WrittenExamRecord,
} from "@/components/admin/written-exam-editor";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";

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

export function WrittenExamsList() {
  const [exams, setExams] = useState<WrittenExamRecord[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WrittenExamRecord>();
  const [reloadKey, setReloadKey] = useState(0);

  const loadExams = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });

      if (status !== "all") {
        params.set("status", status);
      }

      try {
        const response = await fetch(`/api/admin/written-exams?${params}`, {
          signal,
        });
        const result = (await response.json()) as {
          error?: string;
          data?: { exams?: WrittenExamRecord[]; pagination?: Pagination };
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load written exams.");
        }

        setExams(result.data?.exams ?? []);
        setPagination(result.data?.pagination ?? emptyPagination);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load written exams.",
        );
      } finally {
        setLoading(false);
      }
    },
    [page, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadExams(controller.signal);

    return () => controller.abort();
  }, [loadExams, reloadKey]);

  function openEditor(exam?: WrittenExamRecord) {
    setEditing(exam);
    setEditorOpen(true);
  }

  async function setPublished(exam: WrittenExamRecord) {
    const response = await fetch(`/api/admin/written-exams/${exam._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to publish this exam.");
      return;
    }

    setReloadKey((current) => current + 1);
  }

  async function deleteExam(exam: WrittenExamRecord) {
    if (!window.confirm(`Delete ${exam.title} and its submissions?`)) {
      return;
    }

    const response = await fetch(`/api/admin/written-exams/${exam._id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to delete this exam.");
      return;
    }

    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="Filter written exams by status"
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-cream"
        >
          <Plus size={16} />
          New written exam
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading written exams...</p>
      ) : exams.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center">
          <FileText
            aria-hidden="true"
            size={32}
            className="mx-auto text-muted"
          />
          <p className="mt-3 text-sm text-muted">No written exams yet.</p>
          <button
            type="button"
            onClick={() => openEditor()}
            className="mt-3 cursor-pointer text-sm font-medium text-accent hover:underline"
          >
            New written exam
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <article
              key={exam._id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <Badge
                  className={
                    exam.status === "published"
                      ? "border-emerald-600/30 text-emerald-700"
                      : "text-muted"
                  }
                >
                  {exam.status}
                </Badge>
                <DropdownMenu closeOnOutsideClick>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      aria-label={`Actions for ${exam.title}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditor(exam)}>
                      Edit
                    </DropdownMenuItem>
                    {exam.status !== "published" ? (
                      <DropdownMenuItem onClick={() => void setPublished(exam)}>
                        Publish
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => void deleteExam(exam)}
                      destructive
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h2 className="mt-3 font-heading text-lg font-semibold text-primary">
                {exam.title}
              </h2>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted">
                {exam.description || "No description."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <FileText size={14} />
                  {exam.totalQuestions} questions
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} />
                  {exam.durationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Trophy size={14} />
                  {exam.totalMarks} marks
                </span>
              </div>
              <Link
                href={`/admin/mock-exams/written/${exam._id}`}
                className="mt-5 inline-flex min-h-9 cursor-pointer items-center text-sm font-medium text-accent hover:underline"
              >
                Manage questions →
              </Link>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="cursor-pointer rounded border border-border px-3 py-2 text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="cursor-pointer rounded border border-border px-3 py-2 text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <WrittenExamEditor
        exam={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={() => setReloadKey((current) => current + 1)}
      />
    </div>
  );
}
