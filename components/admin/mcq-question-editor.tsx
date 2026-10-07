"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PreliminaryQuestion } from "@/lib/types/exam";

type Props = {
  examId: string;
  question?: PreliminaryQuestion;
  nextOrder: number;
  onSaved: () => void;
  trigger?: React.ReactNode;
};

const emptyState = {
  order: 1,
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  marks: 1,
  subject: "",
  explanation: "",
};

export function MCQQuestionEditor({
  examId,
  question,
  nextOrder,
  onSaved,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            options: [...question.options],
            correctOptionIndex: question.correctOptionIndex,
            marks: question.marks,
            subject: question.subject ?? "",
            explanation: question.explanation ?? "",
          }
        : {
            ...emptyState,
            order: nextOrder,
          },
    );
    setError(null);
  }, [open, question, nextOrder]);

  const questionLength = form.questionText.length;
  const valid =
    form.questionText.trim().length >= 5 &&
    form.options.every((option) => option.trim().length > 0) &&
    form.questionText.trim().length <= 2000;

  async function submit() {
    if (!valid) {
      setError("Please complete the question, all four options, and select a correct answer.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        order: Number(form.order),
        questionText: form.questionText.trim(),
        options: form.options.map((option) => option.trim()),
        correctOptionIndex: form.correctOptionIndex,
        marks: Number(form.marks),
        subject: form.subject.trim(),
        explanation: form.explanation.trim(),
      };

      const url = question
        ? `/api/admin/preliminary-exams/${examId}/questions/${question._id}`
        : `/api/admin/preliminary-exams/${examId}/questions`;

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
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  MCQ question
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
                  <span>Marks</span>
                  <Input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={form.marks}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        marks: Number(event.target.value || 1),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-foreground">
                <span>Question text</span>
                <Textarea
                  rows={4}
                  value={form.questionText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      questionText: event.target.value,
                    }))
                  }
                />
                <span className="text-xs text-muted">
                  {questionLength}/2000 characters
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {form.options.map((option, index) => (
                  <label
                    key={`option-${index}`}
                    className="space-y-2 text-sm text-foreground"
                  >
                    <span>Option {String.fromCharCode(65 + index)}</span>
                    <Input
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...form.options];
                        nextOptions[index] = event.target.value;
                        setForm((current) => ({
                          ...current,
                          options: nextOptions,
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Correct answer</p>
                <div className="flex flex-wrap gap-3">
                  {"ABCD".split("").map((letter, index) => {
                    const selected = form.correctOptionIndex === index;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            correctOptionIndex: index,
                          }))
                        }
                        className={
                          selected
                            ? "inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-cream"
                            : "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground hover:bg-muted/5"
                        }
                      >
                        {selected ? <Check className="h-4 w-4" /> : null}
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

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

              <label className="block space-y-2 text-sm text-foreground">
                <span>Explanation</span>
                <Textarea
                  rows={4}
                  value={form.explanation}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      explanation: event.target.value,
                    }))
                  }
                />
              </label>
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
                disabled={saving || !valid}
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
