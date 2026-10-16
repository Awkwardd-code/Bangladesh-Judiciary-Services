"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  FileSpreadsheet,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ImportExcelDialog } from "@/components/admin/import-excel-dialog";
import { MCQQuestionEditor } from "@/components/admin/mcq-question-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import {
  ExamSettingsField,
  ExamSettingsPanel,
  examTabClass,
} from "@/components/admin/exam-settings-panel";

type PreliminaryExam = {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "published" | "archived";
  durationMinutes: number;
  questionsPerAttempt: number;
  totalQuestions: number;
  totalMarks: number;
  isLocked: boolean;
  negativeMarking: number;
  passMarkPercent: number;
  type?: "free" | "paid";
  scheduledAt?: string;
  closesAt?: string;
};

type PreliminaryQuestion = {
  _id: string;
  order: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject?: string;
  explanation?: string;
};

type ApiResult = {
  error?: string;
  data?: {
    exam?: PreliminaryExam;
    questions?: PreliminaryQuestion[];
  };
};

type PreliminaryTab = "questions" | "settings";

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function PreliminaryExamDetailClient({
  examId,
  initialTab = "questions",
}: {
  examId: string;
  initialTab?: PreliminaryTab;
}) {
  const [exam, setExam] = useState<PreliminaryExam | null>(null);
  const [questions, setQuestions] = useState<PreliminaryQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<PreliminaryTab>(initialTab);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/preliminary-exams/${examId}`);
      const result = (await response.json()) as ApiResult;

      if (!response.ok || !result.data?.exam) {
        throw new Error(result.error ?? "Unable to load preliminary exam.");
      }

      setExam(result.data.exam);
      setQuestions(result.data.questions ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load preliminary exam."
      );
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  async function updateStatus() {
    if (!exam) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/preliminary-exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: exam.status === "published" ? "draft" : "published",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update exam status.");
      }
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update exam status."
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exam) return;

    const form = new FormData(event.currentTarget);
    const questionsPerAttempt = Number(form.get("questionsPerAttempt"));
    const scheduledAtValue = String(form.get("scheduledAt") ?? "");
    const closesAtValue = String(form.get("closesAt") ?? "");
    if (
      scheduledAtValue &&
      closesAtValue &&
      new Date(closesAtValue).getTime() <= new Date(scheduledAtValue).getTime()
    ) {
      setError("Closing time must be later than the scheduled time.");
      return;
    }
    const existingQuestionsPerAttempt = exam.questionsPerAttempt ?? 0;
    const unchangedTarget =
      questionsPerAttempt === (existingQuestionsPerAttempt || 100);
    if (questionsPerAttempt > exam.totalQuestions && !unchangedTarget) {
      setError(
        `Add at least ${questionsPerAttempt} questions before setting this attempt size.`,
      );
      return;
    }

    setSavingSettings(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/preliminary-exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim(),
          durationMinutes: Number(form.get("durationMinutes")),
          ...(questionsPerAttempt <= exam.totalQuestions
            ? { questionsPerAttempt }
            : {}),
          negativeMarking: Number(form.get("negativeMarking")),
          passMarkPercent: Number(form.get("passMarkPercent")),
          type: form.get("type"),
          scheduledAt: scheduledAtValue
            ? new Date(scheduledAtValue).toISOString()
            : null,
          closesAt: closesAtValue
            ? new Date(closesAtValue).toISOString()
            : null,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        data?: { exam?: PreliminaryExam };
      };
      if (!response.ok || !result.data?.exam) {
        throw new Error(result.error ?? "Unable to save exam settings.");
      }
      setExam(result.data.exam);
      toast("Exam settings saved.", "success");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save exam settings.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function deleteQuestion(question: PreliminaryQuestion) {
    if (!window.confirm(`Delete question ${question.order}?`)) return;
    setError("");

    try {
      const response = await fetch(
        `/api/admin/preliminary-exams/${examId}/questions/${question._id}`,
        { method: "DELETE" }
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete question.");
      }
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete question."
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted">
        <LoaderCircle size={18} className="animate-spin" />
        Loading preliminary exam…
      </div>
    );
  }

  if (!exam) {
    return (
      <section className="mx-auto max-w-4xl">
        <p
          role="alert"
          className="rounded-md bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "Preliminary exam not found."}
        </p>
        <Link
          href="/admin/exams"
          className="mt-4 inline-flex items-center gap-2 text-sm text-accent"
        >
          <ArrowLeft size={15} />
          Back to exam management
        </Link>
      </section>
    );
  }

  const targetQuestions = exam.questionsPerAttempt || 1;
  const ready = exam.totalQuestions >= targetQuestions;

  return (
    <section className="mx-auto max-w-5xl">
      <Link
        href="/admin/exams"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeft size={15} />
        Back to exam management
      </Link>

      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-3xl font-bold text-primary">
              {exam.title}
            </h1>
            <Badge className="border-sky-200 bg-sky-50 text-sky-800">
              Preliminary
            </Badge>
            <Badge
              className={
                exam.status === "published"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-border bg-muted/10 text-muted"
              }
            >
              {exam.status}
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            {exam.description || "No exam description."}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span>{exam.totalQuestions} questions</span>
            <span>{exam.durationMinutes} minutes</span>
            {ready ? (
              <span className="text-emerald-700">Question set ready</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <CircleAlert size={14} />
                Locked until at least {targetQuestions} questions are added
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveTab("settings")}
            className="h-10 rounded-lg border border-border px-4"
          >
            <Pencil size={15} />
            Edit settings
          </Button>
          <Button
            type="button"
            variant={exam.status === "published" ? "ghost" : "default"}
            onClick={() => void updateStatus()}
            disabled={busy}
            className="h-10 rounded-lg px-4"
          >
            {busy
              ? "Saving…"
              : exam.status === "published"
                ? "Unpublish"
                : "Publish"}
          </Button>
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex gap-2 border-b border-border">
        {(["questions", "settings"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={examTabClass(activeTab === tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "settings" ? (
        <ExamSettingsPanel
          onSubmit={saveSettings}
          saving={savingSettings}
          description="Edit the exam details, attempt rules, access, and availability."
        >
          <div className="grid gap-5 sm:grid-cols-2">
          <ExamSettingsField label="Title" className="sm:col-span-2">
            <Input
              name="title"
              required
              minLength={3}
              maxLength={200}
              defaultValue={exam.title}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Description / topics covered" className="sm:col-span-2">
            <Textarea
              name="description"
              rows={6}
              maxLength={2000}
              defaultValue={exam.description ?? ""}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Duration (minutes)">
            <Input
              name="durationMinutes"
              type="number"
              min={1}
              max={600}
              required
              defaultValue={exam.durationMinutes}
            />
          </ExamSettingsField>
          <ExamSettingsField
            label="Questions per attempt"
            hint="The exam remains locked until this many questions are available."
          >
            <Input
              name="questionsPerAttempt"
              type="number"
              min={1}
              max={500}
              required
              defaultValue={exam.questionsPerAttempt || 100}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Negative marking">
            <Input
              name="negativeMarking"
              type="number"
              min={0}
              max={2}
              step={0.25}
              required
              defaultValue={exam.negativeMarking}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Pass mark (%)">
            <Input
              name="passMarkPercent"
              type="number"
              min={1}
              max={100}
              required
              defaultValue={exam.passMarkPercent}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Exam access">
            <Select
              className="h-11 w-full"
              name="type"
              defaultValue={exam.type ?? "paid"}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </Select>
          </ExamSettingsField>
          <ExamSettingsField
            label="Scheduled at"
            hint="Leave blank to make the exam available immediately."
          >
            <Input
              name="scheduledAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(exam.scheduledAt)}
            />
          </ExamSettingsField>
          <ExamSettingsField label="Closes at">
            <Input
              name="closesAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(exam.closesAt)}
            />
          </ExamSettingsField>
          </div>
        </ExamSettingsPanel>
      ) : (
      <section className="mt-5 rounded-xl border border-border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">
              Questions
            </h2>
            <p className="mt-1 text-sm text-muted">
              Add questions manually or import them from a spreadsheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ImportExcelDialog
              examId={examId}
              kind="mcq"
              onImported={() => setReloadKey((current) => current + 1)}
            />
            <MCQQuestionEditor
              examId={examId}
              nextOrder={
                Math.max(0, ...questions.map((item) => item.order)) + 1
              }
              onSaved={() => setReloadKey((current) => current + 1)}
              trigger={
                <span className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-cream">
                  <Plus size={15} />
                  Add question
                </span>
              }
            />
          </div>
        </header>

        {questions.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet size={26} className="mx-auto text-muted" />
            <p className="mt-3 font-medium text-primary">No questions yet</p>
            <p className="mt-1 text-sm text-muted">
              Add questions to unlock this exam for students.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {questions.map((question) => (
              <li
                key={question._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Question {question.order}
                    {question.subject ? ` · ${question.subject}` : ""}
                    {` · ${question.marks} ${question.marks === 1 ? "mark" : "marks"}`}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-primary">
                    {question.questionText}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <MCQQuestionEditor
                    examId={examId}
                    question={question}
                    nextOrder={question.order}
                    onSaved={() => setReloadKey((current) => current + 1)}
                    trigger={
                      <span
                        aria-label={`Edit question ${question.order}`}
                        title="Edit question"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary hover:bg-primary/5"
                      >
                        <Pencil size={15} />
                      </span>
                    }
                  />
                  <button
                    type="button"
                    onClick={() => void deleteQuestion(question)}
                    aria-label={`Delete question ${question.order}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
      )}
    </section>
  );
}
