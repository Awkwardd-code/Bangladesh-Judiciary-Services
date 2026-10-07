"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WrittenQuestion } from "@/lib/types/exam";

type Props = {
  examId: string;
  question?: WrittenQuestion;
  nextOrder: number;
  onSaved: () => void;
  trigger?: React.ReactNode;
};

const emptyState = {
  order: 1,
  questionText: "",
  maxMarks: 20,
  subject: "",
};

export function WrittenQuestionEditor({
  examId,
  question,
  nextOrder,
  onSaved,
  trigger,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelAnswerName, setModelAnswerName] = useState<string | null>(null);
  const [modelAnswerUrl, setModelAnswerUrl] = useState<string | null>(null);
  const [modelAnswerPublicId, setModelAnswerPublicId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyState);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      question
        ? {
            order: question.order,
            questionText: question.questionText,
            maxMarks: question.maxMarks,
            subject: question.subject ?? "",
          }
        : {
            ...emptyState,
            order: nextOrder,
          },
    );
    setModelAnswerName(null);
    setModelAnswerUrl(question?.modelAnswerUrl ?? null);
    setModelAnswerPublicId(question?.modelAnswerPublicId ?? null);
    setError(null);
  }, [open, question, nextOrder]);

  async function uploadModelAnswer(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch(
        `/api/admin/written-exams/${examId}/questions/${question?._id ?? "new"}/model-answer`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = (await response.json()) as {
        error?: string;
        data?: { url?: string; publicId?: string };
      };

      if (!response.ok || !result.data?.url || !result.data.publicId) {
        throw new Error(result.error ?? "Unable to upload PDF.");
      }

      setModelAnswerName(file.name);
      setModelAnswerUrl(result.data.url);
      setModelAnswerPublicId(result.data.publicId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to upload PDF.",
      );
    }
  }

  async function submit() {
    if (form.questionText.trim().length < 5) {
      setError("Question text must be at least 5 characters long.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        order: Number(form.order),
        questionText: form.questionText.trim(),
        maxMarks: Number(form.maxMarks),
        subject: form.subject.trim(),
        modelAnswerUrl,
        modelAnswerPublicId,
      };

      const url = question
        ? `/api/admin/written-exams/${examId}/questions/${question._id}`
        : `/api/admin/written-exams/${examId}/questions`;

      const response = await fetch(url, {
        method: question ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save question.");
      }

      setOpen(false);
      onSaved();
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

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-cream"
        >
          <Plus className="h-4 w-4" />
          Add question
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/75 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Written question
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-primary">
                  {question ? "Edit question" : "Add question"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-foreground">
                  <span>Order</span>
                  <Input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        order: Number(event.target.value || 1),
                      }))
                    }
                  />
                </label>

                <label className="space-y-2 text-sm text-foreground">
                  <span>Max marks</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.maxMarks}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        maxMarks: Number(event.target.value || 20),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-foreground">
                <span>Question text</span>
                <Textarea
                  rows={6}
                  value={form.questionText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      questionText: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block space-y-2 text-sm text-foreground">
                <span>Subject</span>
                <Input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm text-foreground">Model answer PDF</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted/5"
                  >
                    <Plus className="h-4 w-4" />
                    {modelAnswerUrl ? "Replace file" : "Upload file"}
                  </button>

                  {modelAnswerName ? (
                    <span className="text-sm text-muted">{modelAnswerName}</span>
                  ) : modelAnswerUrl ? (
                    <a
                      href={modelAnswerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent"
                    >
                      View uploaded file
                    </a>
                  ) : (
                    <span className="text-sm text-muted">No file selected</span>
                  )}

                  {modelAnswerUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setModelAnswerName(null);
                        setModelAnswerUrl(null);
                        setModelAnswerPublicId(null);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-muted/5"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </button>
                  ) : null}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (file) {
                      void uploadModelAnswer(file);
                    }
                  }}
                />
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/5"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={() => void submit()}
                disabled={saving || form.questionText.trim().length < 5}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : question ? (
                  "Save changes"
                ) : (
                  "Create question"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
