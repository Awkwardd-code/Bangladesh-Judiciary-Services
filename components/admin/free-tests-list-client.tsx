"use client";

import Link from "next/link";
import {
  ArchiveRestore,
  Copy,
  EyeOff,
  Globe,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamCard } from "@/components/shared/exam-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";

export type FreeTestSummary = {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "published" | "archived";
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  preliminaryDurationMinutes?: number;
  writtenDurationMinutes?: number;
  writtenQuestionsPerAttempt?: number;
  usesPhases?: boolean;
  questionsPerAttempt?: number;
  passMarkPercent?: number;
  createdAt?: string;
};

function formatRelativeTime(value?: string) {
  if (!value) {
    return "recently";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "recently";
  }

  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  const diffMonths = Math.round(diffDays / 30);

  return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

export function FreeTestsListClient({
  initialFreeTests,
}: {
  initialFreeTests: FreeTestSummary[];
}) {
  const router = useRouter();
  const [tests, setTests] = useState(initialFreeTests);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filteredTests = tests.filter((test) => {
    const matchesSearch = `${test.title} ${test.description ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || test.status === status;

    return matchesSearch && matchesStatus;
  });

  async function handleDelete(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/admin/free-tests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete this free test.");
      }

      setTests((current) => current.filter((test) => test._id !== id));
      router.refresh();
    } catch (error) {
      console.error("Delete free test error", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete this free test."
      );
    }
  }

  async function handleStatus(id: string, nextStatus: "draft" | "published") {
    setError("");

    try {
      const response = await fetch(`/api/admin/free-tests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result?.error ?? "Unable to change this free test status."
        );
      }

      setTests((current) =>
        current.map((test) =>
          test._id === id ? { ...test, status: nextStatus } : test
        )
      );
      router.refresh();
    } catch (error) {
      console.error("Toggle free test status error", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change this free test status."
      );
    }
  }

  async function handleDuplicate(test: FreeTestSummary) {
    setError("");

    try {
      const detailsResponse = await fetch(`/api/admin/free-tests/${test._id}`);

      if (!detailsResponse.ok) {
        const result = await detailsResponse.json();
        throw new Error(result?.error ?? "Unable to load this free test.");
      }

      const details = await detailsResponse.json();
      const sourceTest = details?.data?.freeTest ?? {};
      const sourceQuestions = Array.isArray(details?.data?.questions)
        ? details.data.questions
        : [];
      const hasExplicitPhaseDurations =
        typeof sourceTest.preliminaryDurationMinutes === "number" ||
        typeof sourceTest.writtenDurationMinutes === "number";

      const payload = {
        title: `${sourceTest.title ?? test.title} (copy)`,
        description: sourceTest.description ?? test.description ?? "",
        durationMinutes: Number(
          sourceTest.durationMinutes ?? test.durationMinutes
        ),
        ...(hasExplicitPhaseDurations
          ? {
              preliminaryDurationMinutes: Number(
                sourceTest.preliminaryDurationMinutes ?? 0
              ),
              writtenDurationMinutes: Number(
                sourceTest.writtenDurationMinutes ?? 0
              ),
            }
          : {}),
        writtenQuestionsPerAttempt: Number(
          sourceTest.writtenQuestionsPerAttempt ??
            test.writtenQuestionsPerAttempt ??
            0
        ),
        passMarkPercent: Number(sourceTest.passMarkPercent ?? 50),
        questionsPerAttempt: Number(
          sourceTest.questionsPerAttempt ?? test.questionsPerAttempt ?? 0
        ),
        order: Number(sourceTest.order ?? 0),
        scheduledAt: sourceTest.scheduledAt ?? undefined,
        closesAt: sourceTest.closesAt ?? undefined,
        status: "draft",
      };

      const createResponse = await fetch("/api/admin/free-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!createResponse.ok) {
        const result = await createResponse.json();
        throw new Error(result?.error ?? "Unable to duplicate this free test.");
      }

      const createResult = await createResponse.json();
      const duplicateId =
        createResult?.data?.exam?._id ??
        createResult?.data?.freeTest?._id ??
        createResult?.data?._id;

      if (!duplicateId) {
        throw new Error("Unable to resolve the duplicated free test id.");
      }

      if (sourceQuestions.length > 0) {
        const questionPayload = {
          questions: sourceQuestions.map((question: any) => ({
            sourceCollection: question.sourceCollection,
            questionId: question.id,
          })),
        };

        const questionResponse = await fetch(
          `/api/admin/free-tests/${duplicateId}/questions`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(questionPayload),
          }
        );

        if (!questionResponse.ok) {
          const result = await questionResponse.json();
          throw new Error(
            result?.error ?? "Unable to duplicate the selected questions."
          );
        }
      }

      router.push(`/admin/free-tests/${duplicateId}`);
      router.refresh();
    } catch (error) {
      console.error("Duplicate free test error", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to duplicate this free test."
      );
    }
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            Free model tests
          </h1>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <Link
          href="/admin/free-tests/new"
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-cream hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create test
        </Link>
      </div>

      <FilterBar
        showClear={Boolean(search || status !== "all")}
        onClear={() => {
          setSearch("");
          setStatus("all");
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search free model tests"
          className="sm:max-w-80"
        />
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          placeholder="All statuses"
          options={[
            { value: "all", label: "All statuses" },
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </FilterBar>

      {filteredTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-lg font-semibold text-primary">
            {tests.length === 0
              ? "No free tests yet."
              : "No free tests match these filters."}
          </p>
          <p className="mt-2 text-sm text-muted">
            Create a new free model test to start collecting student attempts.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <ExamCard
              key={test._id}
              exam={{
                id: test._id,
                kind: "free",
                title: test.title,
                description: test.description ?? "",
                durationMinutes: test.durationMinutes,
                totalQuestions: test.totalQuestions,
                questionsPerAttempt:
                  test.questionsPerAttempt ?? test.totalQuestions,
                totalMarks: test.totalMarks,
                passMarkPercent: test.passMarkPercent,
                isFree: true,
                price: 0,
                courseId: null,
                courseTitle: null,
                courseSlug: null,
                status: test.status,
              }}
              variant="admin"
              subtitle={[
                `Created ${formatRelativeTime(test.createdAt)}`,
                test.usesPhases
                  ? `Preliminary ${test.preliminaryDurationMinutes ?? test.durationMinutes} min`
                  : null,
                test.usesPhases
                  ? `Written ${test.writtenDurationMinutes ?? 0} min`
                  : null,
                !test.usesPhases
                  ? `Duration ${test.durationMinutes} min`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              href={`/admin/free-tests/${test._id}`}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/free-tests/${test._id}`}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground hover:bg-primary/5"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      void handleStatus(
                        test._id,
                        test.status === "published" ? "draft" : "published"
                      )
                    }
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground hover:bg-primary/5"
                  >
                    {test.status === "published" ? (
                      <EyeOff size={14} />
                    ) : test.status === "archived" ? (
                      <ArchiveRestore size={14} />
                    ) : (
                      <Globe size={14} />
                    )}
                    {test.status === "published"
                      ? "Unpublish"
                      : test.status === "archived"
                        ? "Restore"
                        : "Publish"}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button
                        type="button"
                        aria-label={`More actions for ${test.title}`}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-primary hover:bg-primary/5"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => void handleDuplicate(test)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Copy size={14} />
                          Duplicate
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => void handleDelete(test._id)}
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
    </main>
  );
}
