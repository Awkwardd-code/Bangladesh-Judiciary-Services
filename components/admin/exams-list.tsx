"use client";

import Link from "next/link";
import {
  ArchiveRestore,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ExamEditor } from "@/components/admin/exam-editor";
import { ExamCard } from "@/components/shared/exam-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";

export type AdminExam = {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  questionsPerAttempt?: number;
  status: "draft" | "published" | "archived";
  scheduledAt?: string;
};

export function ExamsList() {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = `${exam.title} ${exam.description ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || exam.status === status;

    return matchesSearch && matchesStatus;
  });

  async function load() {
    const response = await fetch("/api/admin/preliminary-exams");
    const result = (await response.json()) as {
      data?: { exams?: AdminExam[] };
    };
    setExams(result.data?.exams ?? []);
  }

  useEffect(() => {
    void load();
    const open = () => setModal(true);
    window.addEventListener("open-exam-editor", open);
    return () => window.removeEventListener("open-exam-editor", open);
  }, []);

  async function changeStatus(exam: AdminExam) {
    const response = await fetch(`/api/admin/preliminary-exams/${exam._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: exam.status === "published" ? "draft" : "published",
      }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      window.alert(result.error ?? "Unable to update exam status.");
      return;
    }

    await load();
  }

  async function deleteExam(exam: AdminExam) {
    if (!window.confirm(`Delete ${exam.title}?`)) {
      return;
    }

    const response = await fetch(`/api/admin/preliminary-exams/${exam._id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      window.alert(result.error ?? "Unable to delete exam.");
      return;
    }

    await load();
  }

  return (
    <>
      <header className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            Model Tests
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage model tests for students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm text-cream"
        >
          <Plus size={16} />
          New exam
        </button>
      </header>
      <FilterBar
        className="mt-5"
        showClear={Boolean(search || status !== "all")}
        onClear={() => {
          setSearch("");
          setStatus("all");
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search model tests"
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
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredExams.map((exam) => (
          <ExamCard
            key={exam._id}
            exam={{
              id: exam._id,
              kind: "preliminary",
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
            href={`/admin/mock-exams/${exam._id}`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/mock-exams/${exam._id}`}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground hover:bg-primary/5"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void changeStatus(exam)}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground hover:bg-primary/5"
                >
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
                </button>
                <button
                  type="button"
                  onClick={() => void deleteExam(exam)}
                  aria-label={`Delete ${exam.title}`}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            }
          />
        ))}
        {filteredExams.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted md:col-span-2 xl:col-span-3">
            {exams.length === 0
              ? "No model tests yet. Create your first exam."
              : "No model tests match these filters."}
          </div>
        ) : null}
      </div>
      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <ExamEditor
              onCancel={() => setModal(false)}
              onSaved={() => {
                setModal(false);
                void load();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
