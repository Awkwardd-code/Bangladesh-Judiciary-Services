"use client";

import Link from "next/link";
import {
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ExamLifecycleBar } from "@/components/admin/exam-lifecycle-bar";
import { ExamReadinessCard } from "@/components/admin/exam-readiness-card";
import { ExamEditor } from "@/components/admin/exam-editor";
import { ImportExcelDialog } from "@/components/admin/import-excel-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Question = {
  _id: string;
  order: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject?: string;
  explanation?: string;
};
type Exam = {
  _id: string;
  title: string;
  status: "draft" | "published" | "archived";
  totalQuestions: number;
  totalMarks: number;
  questionsPerAttempt?: number;
  durationMinutes: number;
  description?: string;
  negativeMarking?: number;
  scheduledAt?: string | Date;
  closesAt?: string | Date;
};

type Attempt = {
  id: string;
  status: string;
  submittedAt: string | null;
  score: number;
  maxScore: number;
  user: { name: string; email: string } | null;
};

export function ExamDetailClient({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "questions" | "settings" | "attempts"
  >("questions");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [question, setQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    marks: "1",
    subject: "",
    explanation: "",
  });

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/preliminary-exams/${examId}`);
    const result = (await response.json()) as {
      data?: { exam?: Exam; questions?: Question[] };
    };
    setExam(result.data?.exam ?? null);
    setQuestions(result.data?.questions ?? []);
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (activeTab !== "attempts") {
      return;
    }

    let cancelled = false;

    async function loadAttempts() {
      try {
        const response = await fetch(
          `/api/admin/preliminary-exams/${examId}/attempts`
        );
        const result = (await response.json()) as {
          error?: string;
          data?: { attempts?: Attempt[] };
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load exam attempts.");
        }

        if (!cancelled) {
          setAttempts(result.data?.attempts ?? []);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load exam attempts."
          );
        }
      }
    }

    void loadAttempts();

    return () => {
      cancelled = true;
    };
  }, [activeTab, examId]);

  function openQuestionEditor(item?: Question) {
    setEditingQuestionId(item?._id ?? null);
    setQuestion(
      item
        ? {
            questionText: item.questionText,
            options: [...item.options],
            correctOptionIndex: item.correctOptionIndex,
            marks: String(item.marks),
            subject: item.subject ?? "",
            explanation: item.explanation ?? "",
          }
        : {
            questionText: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
            marks: "1",
            subject: "",
            explanation: "",
          }
    );
    setFormOpen(true);
  }

  async function saveQuestion() {
    setError("");

    try {
      const questionId = editingQuestionId;
      const response = await fetch(
        questionId
          ? `/api/admin/preliminary-exams/${examId}/questions/${questionId}`
          : `/api/admin/preliminary-exams/${examId}/questions`,
        {
          method: questionId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...question,
            marks: Number(question.marks),
            order:
              questions.find((item) => item._id === questionId)?.order ??
              Math.max(0, ...questions.map((item) => item.order)) + 1,
          }),
        }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save question.");
      }

      setFormOpen(false);
      await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save question."
      );
    }
  }

  async function removeQuestion(id: string) {
    if (window.confirm("Delete this question?")) {
      const response = await fetch(
        `/api/admin/preliminary-exams/${examId}/questions/${id}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to delete question.");
        return;
      }

      await load();
    }
  }

  async function moveQuestion(item: Question, direction: -1 | 1) {
    const index = questions.findIndex(
      (questionItem) => questionItem._id === item._id
    );
    const target = questions[index + direction];

    if (!target) {
      return;
    }

    const temporaryOrder =
      Math.max(...questions.map((entry) => entry.order)) + 1;
    const changes = [
      { question: item, order: temporaryOrder },
      { question: target, order: item.order },
      { question: item, order: target.order },
    ];

    for (const change of changes) {
      const response = await fetch(
        `/api/admin/preliminary-exams/${examId}/questions/${change.question._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: change.order }),
        }
      );

      if (!response.ok) {
        setError("Unable to reorder questions.");
        return;
      }
    }

    await load();
  }

  async function changeStatus() {
    const nextStatus =
      exam?.status === "published"
        ? "draft"
        : exam?.status === "archived"
          ? "published"
          : "published";
    const response = await fetch(`/api/admin/preliminary-exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to change exam status.");
      return;
    }

    await load();
  }

  if (!exam) return <p className="text-sm text-muted">Loading exam...</p>;
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/mock-exams" className="text-sm text-accent">
        ← Mock exams
      </Link>
      <div className="sticky top-0 z-30 mt-4 flex flex-col gap-3 border-b border-border bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            {exam.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {exam.totalQuestions}{" "}
            {exam.totalQuestions === 1 ? "question" : "questions"} ·{" "}
            {exam.totalMarks} marks · {exam.durationMinutes ?? 0} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/mock-exams/${examId}`}
            target="_blank"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-foreground"
          >
            <Eye size={16} />
            Preview
          </Link>
          <button
            type="button"
            onClick={() => openQuestionEditor()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-cream"
          >
            <Plus size={16} />
            Add question
          </button>
          <ImportExcelDialog
            examId={examId}
            kind="mcq"
            onImported={() => void load()}
          />
          <button
            type="button"
            onClick={() => void changeStatus()}
            disabled={
              exam.status !== "published" &&
              questions.length < (exam.questionsPerAttempt ?? 1)
            }
            title={
              exam.status !== "published" &&
              questions.length < (exam.questionsPerAttempt ?? 1)
                ? `Add at least ${exam.questionsPerAttempt ?? 1} questions before publishing.`
                : undefined
            }
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
              exam.status === "published"
                ? "border border-border text-foreground"
                : "bg-primary text-cream"
            }`}
          >
            {exam.status === "published" ? (
              <EyeOff size={16} />
            ) : exam.status === "archived" ? (
              <ArchiveRestore size={16} />
            ) : (
              <Globe size={16} />
            )}
            {exam.status === "published"
              ? "Unpublish"
              : exam.status === "archived"
                ? "Restore"
                : "Publish"}
          </button>
        </div>
      </div>
      <div className="mt-5 space-y-5">
        <ExamLifecycleBar
          status={exam.status}
          totalQuestions={questions.length}
          requiredQuestions={exam.questionsPerAttempt ?? 1}
          hasCourse={false}
        />
        <ExamReadinessCard
          totalQuestions={questions.length}
          requiredQuestions={exam.questionsPerAttempt ?? 1}
          hasCourse={false}
        />
        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 border-b border-border">
          {(["questions", "settings", "attempts"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm capitalize ${
                activeTab === tab
                  ? "border-accent font-medium text-primary"
                  : "border-transparent text-muted hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "settings" ? (
          <ExamEditor exam={exam} onSaved={() => void load()} />
        ) : activeTab === "attempts" ? (
          attempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-heading text-lg font-semibold text-primary">
                No attempts yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-background text-xs text-muted">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Submitted at</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary">
                          {attempt.user?.name ?? "Unknown student"}
                        </p>
                        <p className="text-xs text-muted">
                          {attempt.user?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : "Not submitted"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {attempt.score} / {attempt.maxScore}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted">
                        {attempt.status.replaceAll("-", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {questions.map((item, index) => (
              <article
                key={item._id}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-primary/[0.02]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-foreground">
                    {item.order}. {item.questionText}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move question up"
                      disabled={index === 0}
                      onClick={() => void moveQuestion(item, -1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move question down"
                      disabled={index === questions.length - 1}
                      onClick={() => void moveQuestion(item, 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit question"
                      onClick={() => openQuestionEditor(item)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-primary/5"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete question"
                      onClick={() => void removeQuestion(item._id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {item.options.map((option, index) => (
                    <li
                      key={option}
                      className={
                        index === item.correctOptionIndex
                          ? "border-l-2 border-accent bg-accent/10 p-2 text-sm"
                          : "p-2 text-sm text-muted"
                      }
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </li>
                  ))}
                </ol>
                {item.explanation ? (
                  <p className="mt-3 text-sm text-muted">{item.explanation}</p>
                ) : null}
              </article>
            ))}
            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
                No questions yet.
              </div>
            ) : null}
          </div>
        )}
      </div>
      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary">
              {editingQuestionId ? "Edit question" : "Add question"}
            </h2>
            <div className="mt-5 space-y-3">
              <Textarea
                rows={4}
                placeholder="Question text"
                value={question.questionText}
                onChange={(event) =>
                  setQuestion({ ...question, questionText: event.target.value })
                }
              />
              {question.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(event) => {
                    const options = [...question.options];
                    options[index] = event.target.value;
                    setQuestion({ ...question, options });
                  }}
                />
              ))}
              <label className="text-sm text-muted">
                Correct option
                <Select
                  value={String(question.correctOptionIndex)}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      correctOptionIndex: Number(event.target.value),
                    })
                  }
                >
                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>
                </Select>
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={question.marks}
                onChange={(event) =>
                  setQuestion({ ...question, marks: event.target.value })
                }
              />
              <Input
                placeholder="Subject"
                value={question.subject}
                onChange={(event) =>
                  setQuestion({ ...question, subject: event.target.value })
                }
              />
              <Textarea
                rows={3}
                placeholder="Explanation"
                value={question.explanation}
                onChange={(event) =>
                  setQuestion({ ...question, explanation: event.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="cursor-pointer px-4 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveQuestion()}
                className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm text-cream"
              >
                Save question
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
