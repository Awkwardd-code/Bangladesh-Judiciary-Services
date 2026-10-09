"use client";

import {
  ArchiveRestore,
  EyeOff,
  FileText,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  WrittenExamEditor,
  type WrittenExamRecord,
} from "@/components/admin/written-exam-editor";
import { ExamCard } from "@/components/shared/exam-card";
import { AdminMockExamCardsSkeleton } from "@/components/skeletons/admin-mock-exams-skeleton";
import { SearchInput } from "@/components/ui/search-input";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WrittenExamRecord>();
  const [reloadKey, setReloadKey] = useState(0);
  const filteredExams = exams.filter((exam) =>
    `${exam.title} ${exam.description ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

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
            : "Unable to load written exams."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, status]
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
      body: JSON.stringify({
        status: exam.status === "published" ? "draft" : "published",
      }),
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
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search written exams"
          className="sm:max-w-80"
        />
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
        <div className="mt-6">
          <AdminMockExamCardsSkeleton />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center">
          <FileText
            aria-hidden="true"
            size={32}
            className="mx-auto text-muted"
          />
          <p className="mt-3 text-sm text-muted">
            {exams.length === 0
              ? "No written exams yet."
              : "No written exams match these filters."}
          </p>
          <button
            type="button"
            onClick={() => openEditor()}
            className="mt-3 cursor-pointer text-sm font-medium text-accent hover:underline"
          >
            New written exam
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={{
                id: exam._id,
                kind: "written",
                title: exam.title,
                description: exam.description ?? "",
                durationMinutes: exam.durationMinutes,
                totalQuestions: exam.totalQuestions,
                questionsPerAttempt:
                  exam.questionsPerAttempt ?? exam.totalQuestions,
                totalMarks: exam.totalMarks,
                isFree: false,
                price: 0,
                courseId: null,
                courseTitle: null,
                courseSlug: null,
                status: exam.status,
              }}
              variant="admin"
              href={`/admin/mock-exams/written/${exam._id}`}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor(exam)}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground hover:bg-primary/5"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <DropdownMenu closeOnOutsideClick>
                    <DropdownMenuTrigger>
                      <button
                        type="button"
                        aria-label={`Actions for ${exam.title}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => void setPublished(exam)}>
                        <span className="inline-flex items-center gap-2">
                          {exam.status === "published" ? (
                            <EyeOff size={14} />
                          ) : exam.status === "archived" ? (
                            <ArchiveRestore size={14} />
                          ) : (
                            <Globe size={14} />
                          )}
                          {exam.status === "published"
                            ? "Unpublish"
                            : exam.status === "archived"
                              ? "Restore"
                              : "Publish"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => void deleteExam(exam)}
                        destructive
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 size={14} />
                          Delete
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
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
