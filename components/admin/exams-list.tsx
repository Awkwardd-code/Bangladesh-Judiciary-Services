"use client";

import Link from "next/link";
import { Clock, FileText, Plus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type AdminExam = {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  status: string;
  scheduledAt?: string;
};

export function ExamsList() {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: "180",
    negativeMarking: "0",
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

  async function createExam() {
    const response = await fetch("/api/admin/preliminary-exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        negativeMarking: Number(form.negativeMarking),
      }),
    });
    const result = (await response.json()) as { data?: { exam?: AdminExam } };
    setModal(false);
    await load();
    if (result.data?.exam)
      window.location.href = `/admin/mock-exams/${result.data.exam._id}`;
  }

  return (
    <>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => setModal(true)}
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm text-cream"
        >
          New exam
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <article
            key={exam._id}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <Badge
              className={
                exam.status === "published"
                  ? "border-emerald-600/30 text-emerald-700"
                  : "text-muted"
              }
            >
              {exam.status}
            </Badge>
            <h2 className="mt-4 font-heading text-lg font-semibold text-primary">
              {exam.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {exam.description || "No description."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {exam.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {exam.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Trophy size={14} />
                {exam.totalMarks} marks
              </span>
            </div>
            <Link
              href={`/admin/mock-exams/${exam._id}`}
              className="mt-5 inline-flex cursor-pointer text-sm font-medium text-accent"
            >
              Manage questions →
            </Link>
          </article>
        ))}
        {exams.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted md:col-span-2 xl:col-span-3">
            No mock exams yet.
          </div>
        ) : null}
      </div>
      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary">
              New exam
            </h2>
            <div className="mt-5 space-y-3">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
              <Textarea
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
              <Input
                type="number"
                min="1"
                max="600"
                placeholder="Duration in minutes"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm({ ...form, durationMinutes: event.target.value })
                }
              />
              <Input
                type="number"
                min="0"
                max="2"
                step="0.25"
                placeholder="Negative marking"
                value={form.negativeMarking}
                onChange={(event) =>
                  setForm({ ...form, negativeMarking: event.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="cursor-pointer px-4 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createExam}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-cream"
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
