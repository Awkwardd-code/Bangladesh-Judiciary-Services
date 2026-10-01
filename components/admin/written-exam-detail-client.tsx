"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ImportExcelDialog } from "@/components/admin/import-excel-dialog";
import { WrittenExamRecord } from "@/components/admin/written-exam-editor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WrittenQuestion = {
  _id: string;
  order: number;
  questionText: string;
  maxMarks: number;
  subject?: string;
  modelAnswerUrl?: string;
  modelAnswerPublicId?: string;
};

type Submission = {
  id: string;
  status: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  user: { name: string; email: string } | null;
};

type WrittenQuestionForm = {
  questionText: string;
  maxMarks: string;
  subject: string;
};

const emptyQuestion: WrittenQuestionForm = {
  questionText: "",
  maxMarks: "20",
  subject: "",
};

type DetailTab = "questions" | "settings" | "submissions";

export function WrittenExamDetailClient({ examId }: { examId: string }) {
  const [exam, setExam] = useState<WrittenExamRecord | null>(null);
  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("questions");
  const [questionOpen, setQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<WrittenQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    durationMinutes: "180",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const uploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [examResponse, questionsResponse] = await Promise.all([
        fetch(`/api/admin/written-exams/${examId}`),
        fetch(`/api/admin/written-exams/${examId}/questions`),
      ]);
      const [examResult, questionsResult] = (await Promise.all([
        examResponse.json(),
        questionsResponse.json(),
      ])) as [
        { error?: string; data?: { exam?: WrittenExamRecord } },
        { error?: string; data?: { questions?: WrittenQuestion[] } },
      ];

      if (!examResponse.ok || !examResult.data?.exam) {
        throw new Error(examResult.error ?? "Unable to load written exam.");
      }

      if (!questionsResponse.ok) {
        throw new Error(questionsResult.error ?? "Unable to load questions.");
      }

      const loadedExam = examResult.data.exam;
      setExam(loadedExam);
      setQuestions(questionsResult.data?.questions ?? []);
      setSettings({
        title: loadedExam.title,
        description: loadedExam.description ?? "",
        durationMinutes: String(loadedExam.durationMinutes),
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load written exam.",
      );
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (activeTab !== "submissions") {
      return;
    }

    const params = new URLSearchParams({ examId, limit: "100" });
    void fetch(`/api/admin/written-submissions?${params}`)
      .then(async (response) => {
        const result = (await response.json()) as {
          data?: { submissions?: Submission[] };
        };

        if (response.ok) {
          setSubmissions(result.data?.submissions ?? []);
        }
      })
      .catch(() => setSubmissions([]));
  }, [activeTab, examId]);

  function openQuestionEditor(question?: WrittenQuestion) {
    setEditingQuestion(question ?? null);
    setQuestionForm(
      question
        ? {
            questionText: question.questionText,
            maxMarks: String(question.maxMarks),
            subject: question.subject ?? "",
          }
        : emptyQuestion,
    );
    setQuestionOpen(true);
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const questionId = editingQuestion?._id;
    const url = questionId
      ? `/api/admin/written-exams/${examId}/questions/${questionId}`
      : `/api/admin/written-exams/${examId}/questions`;

    try {
      const response = await fetch(url, {
        method: questionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order:
            editingQuestion?.order ??
            Math.max(0, ...questions.map((item) => item.order)) + 1,
          questionText: questionForm.questionText,
          maxMarks: Number(questionForm.maxMarks),
          subject: questionForm.subject,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save question.");
      }

      setQuestionOpen(false);
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save question.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/written-exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          durationMinutes: Number(settings.durationMinutes),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save exam settings.");
      }

      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save exam settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishExam() {
    const response = await fetch(`/api/admin/written-exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to publish exam.");
      return;
    }

    setReloadKey((current) => current + 1);
  }

  async function deleteQuestion(question: WrittenQuestion) {
    if (!window.confirm("Delete this written question?")) {
      return;
    }

    const response = await fetch(
      `/api/admin/written-exams/${examId}/questions/${question._id}`,
      { method: "DELETE" },
    );
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to delete question.");
      return;
    }

    setReloadKey((current) => current + 1);
  }

  async function moveQuestion(question: WrittenQuestion, direction: -1 | 1) {
    const index = questions.findIndex((item) => item._id === question._id);
    const target = questions[index + direction];

    if (!target) {
      return;
    }

    const temporaryOrder = Math.max(...questions.map((item) => item.order)) + 1;
    const updates = [
      { item: question, order: temporaryOrder },
      { item: target, order: question.order },
      { item: question, order: target.order },
    ];

    for (const update of updates) {
      const response = await fetch(
        `/api/admin/written-exams/${examId}/questions/${update.item._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: update.order }),
        },
      );

      if (!response.ok) {
        setError("Unable to reorder questions.");
        return;
      }
    }

    setReloadKey((current) => current + 1);
  }

  async function uploadModelAnswer(question: WrittenQuestion, file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const uploadResponse = await fetch(
      `/api/admin/written-exams/${examId}/questions/${question._id}/model-answer`,
      { method: "POST", body: formData },
    );
    const uploadResult = (await uploadResponse.json()) as {
      error?: string;
      data?: { url?: string; publicId?: string };
    };

    if (
      !uploadResponse.ok ||
      !uploadResult.data?.url ||
      !uploadResult.data.publicId
    ) {
      setError(uploadResult.error ?? "Unable to upload model answer PDF.");
      return;
    }

    const saveResponse = await fetch(
      `/api/admin/written-exams/${examId}/questions/${question._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelAnswerUrl: uploadResult.data.url,
          modelAnswerPublicId: uploadResult.data.publicId,
        }),
      },
    );

    if (!saveResponse.ok) {
      setError("The PDF uploaded but could not be attached to the question.");
      return;
    }

    setReloadKey((current) => current + 1);
  }

  if (loading || !exam) {
    return (
      <div className="mx-auto max-w-6xl">
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <p className="text-sm text-muted">Loading written exam...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/mock-exams"
        className="cursor-pointer text-sm text-accent hover:underline"
      >
        ← Mock exams
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-primary">
              {exam.title}
            </h1>
            <Badge className="text-muted">{exam.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">
            {exam.totalQuestions} questions · {exam.totalMarks} marks ·{" "}
            {exam.durationMinutes} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openQuestionEditor()}
            className="h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-medium text-cream"
          >
            Add question
          </button>
          <ImportExcelDialog
            examId={examId}
            kind="written"
            onImported={() => setReloadKey((current) => current + 1)}
          />
          {exam.status !== "published" ? (
            <button
              type="button"
              onClick={() => void publishExam()}
              className="h-10 cursor-pointer rounded-md border border-accent px-4 text-sm font-medium text-accent"
            >
              Publish
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["questions", "settings", "submissions"] as DetailTab[]).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "cursor-pointer border-b-2 border-accent px-4 py-3 text-sm font-medium capitalize text-primary"
                  : "cursor-pointer px-4 py-3 text-sm capitalize text-muted hover:text-primary"
              }
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {activeTab === "questions" ? (
        <section className="mt-5 space-y-4">
          {questions.map((question, index) => (
            <article
              key={question._id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Question {question.order} · Max {question.maxMarks} marks
                    {question.subject ? ` · ${question.subject}` : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {question.questionText}
                  </p>
                </div>
                <DropdownMenu closeOnOutsideClick>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      aria-label={`Actions for question ${question.order}`}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
                    >
                      <span aria-hidden="true">⋯</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => openQuestionEditor(question)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === 0}
                      onClick={() => void moveQuestion(question, -1)}
                    >
                      Move up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === questions.length - 1}
                      onClick={() => void moveQuestion(question, 1)}
                    >
                      Move down
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onClick={() => void deleteQuestion(question)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {question.modelAnswerUrl ? (
                  <Link
                    href={question.modelAnswerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer text-sm font-medium text-accent hover:underline"
                  >
                    View model answer
                  </Link>
                ) : (
                  <span className="text-xs text-muted">
                    No model answer PDF
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => uploadInputRefs.current[question._id]?.click()}
                  className="cursor-pointer text-sm text-accent underline-offset-2 hover:underline"
                >
                  {question.modelAnswerUrl
                    ? "Replace PDF"
                    : "Upload model answer PDF"}
                </button>
                <input
                  ref={(node) => {
                    uploadInputRefs.current[question._id] = node;
                  }}
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-label={`Upload model answer PDF for question ${question.order}`}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (file) {
                      void uploadModelAnswer(question, file);
                    }
                  }}
                />
              </div>
            </article>
          ))}

          {questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
              No written questions yet.
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "settings" ? (
        <form onSubmit={saveSettings} className="mt-6 max-w-2xl space-y-4">
          <label className="block space-y-2 text-sm font-medium text-primary">
            Title
            <Input
              required
              value={settings.title}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-primary">
            Description
            <Textarea
              rows={5}
              value={settings.description}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-primary">
            Duration in minutes
            <Input
              type="number"
              min={1}
              max={600}
              value={settings.durationMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                }))
              }
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm font-medium text-cream disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      ) : null}

      {activeTab === "submissions" ? (
        <section className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
          {submissions.length === 0 ? (
            <p className="p-8 text-sm text-muted">No submissions yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="cursor-pointer hover:bg-primary/[0.025]"
                    onClick={() => {
                      window.location.href = `/admin/written-submissions/${submission.id}`;
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="block font-medium text-primary">
                        {submission.user?.name ?? "Unknown student"}
                      </span>
                      <span className="block text-xs text-muted">
                        {submission.user?.email ?? ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="text-muted">{submission.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {submission.totalScore} / {submission.maxScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {questionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="written-question-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6"
          >
            <h2
              id="written-question-title"
              className="font-heading text-xl font-bold text-primary"
            >
              {editingQuestion ? "Edit question" : "Add written question"}
            </h2>
            <form onSubmit={saveQuestion} className="mt-5 space-y-4">
              <label className="block space-y-2 text-sm font-medium text-primary">
                Question
                <Textarea
                  rows={6}
                  minLength={5}
                  maxLength={5000}
                  required
                  value={questionForm.questionText}
                  onChange={(event) =>
                    setQuestionForm((current) => ({
                      ...current,
                      questionText: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-primary">
                  Maximum marks
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={questionForm.maxMarks}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        maxMarks: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-primary">
                  Subject
                  <Input
                    maxLength={80}
                    value={questionForm.subject}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <footer className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setQuestionOpen(false)}
                  className="h-10 cursor-pointer px-4 text-sm text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm font-medium text-cream disabled:opacity-50"
                >
                  Save question
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
