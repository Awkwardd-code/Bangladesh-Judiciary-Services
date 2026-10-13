"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";

type QuestionValue = {
  _id?: string;
  order: number;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  marks: number;
  maxMarks?: number;
  subject?: string;
  explanation?: string;
};

type QuestionForm = {
  order: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: string;
  subject: string;
  explanation: string;
  maxMarks: string;
};

function emptyForm(nextOrder: number): QuestionForm {
  return {
    order: String(nextOrder),
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    marks: "1",
    subject: "",
    explanation: "",
    maxMarks: "1",
  };
}

export function QuestionEditor({
  open,
  kind,
  examId,
  question,
  nextOrder,
  onSave,
  onClose,
}: {
  open: boolean;
  kind: "preliminary" | "written";
  examId: string;
  question?: QuestionValue | null;
  nextOrder: number;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<QuestionForm>(() => emptyForm(nextOrder));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      question
        ? {
            order: String(question.order),
            questionText: question.questionText,
            options: question.options ?? ["", "", "", ""],
            correctOptionIndex: question.correctOptionIndex ?? 0,
            marks: String(question.marks),
            subject: question.subject ?? "",
            explanation: question.explanation ?? "",
            maxMarks: String(question.maxMarks ?? question.marks),
          }
        : emptyForm(nextOrder),
    );
    setError("");
  }, [kind, nextOrder, open, question]);

  if (!open) {
    return null;
  }

  async function saveQuestion() {
    setError("");
    const order = Number(form.order);
    const marks = Number(kind === "written" ? form.maxMarks : form.marks);
    const validQuestion =
      Number.isInteger(order) &&
      order >= 1 &&
      form.questionText.trim().length >= 5 &&
      Number.isFinite(marks) &&
      marks >= (kind === "written" ? 1 : 0.5) &&
      (kind === "written" ||
        form.options.every((option) => option.trim().length > 0));

    if (!validQuestion) {
      setError("Complete the required question fields before saving.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        order,
        questionText: form.questionText.trim(),
        subject: form.subject.trim(),
        ...(kind === "written"
          ? { maxMarks: marks }
          : {
              options: form.options.map((option) => option.trim()),
              correctOptionIndex: form.correctOptionIndex,
              marks,
              explanation: form.explanation.trim(),
            }),
      };
      const response = await fetch(
        question?._id
          ? `/api/admin/exams/${examId}/questions/${question._id}`
          : `/api/admin/exams/${examId}/questions`,
        {
          method: question?._id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save question.");
      }

      toast("Question saved.");
      onClose();
      onSave();
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
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-editor-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="question-editor-title"
          className="font-heading text-xl font-bold text-primary"
        >
          {question ? "Edit question" : "Add question"}
        </h2>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2 text-sm text-primary">
            Order
            <Input
              type="number"
              min={1}
              value={form.order}
              onChange={(event) =>
                setForm((current) => ({ ...current, order: event.target.value }))
              }
            />
          </label>

          <label className="block space-y-2 text-sm text-primary">
            Question text
            <Textarea
              rows={kind === "written" ? 6 : 4}
              value={form.questionText}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  questionText: event.target.value,
                }))
              }
            />
          </label>

          {kind === "preliminary" ? (
            <>
              {form.options.map((option, index) => (
                <label
                  key={`option-${index}`}
                  className="block space-y-2 text-sm text-primary"
                >
                  Option {String.fromCharCode(65 + index)}
                  <Input
                    value={option}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        options: current.options.map((value, optionIndex) =>
                          optionIndex === index ? event.target.value : value,
                        ),
                      }))
                    }
                  />
                </label>
              ))}

              <fieldset className="space-y-2">
                <legend className="text-sm text-primary">Correct option</legend>
                <div className="flex flex-wrap gap-4">
                  {form.options.map((_, index) => (
                    <label
                      key={`correct-option-${index}`}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="correctOptionIndex"
                        value={index}
                        checked={form.correctOptionIndex === index}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            correctOptionIndex: index,
                          }))
                        }
                      />
                      {String.fromCharCode(65 + index)}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}

          <label className="block space-y-2 text-sm text-primary">
            {kind === "written" ? "Max marks" : "Marks"}
            <Input
              type="number"
              min={kind === "written" ? 1 : 0.5}
              max={kind === "written" ? 100 : 10}
              step={kind === "written" ? 1 : 0.5}
              value={kind === "written" ? form.maxMarks : form.marks}
              onChange={(event) =>
                setForm((current) =>
                  kind === "written"
                    ? { ...current, maxMarks: event.target.value }
                    : { ...current, marks: event.target.value },
                )
              }
            />
          </label>

          <label className="block space-y-2 text-sm text-primary">
            Subject
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

          {kind === "preliminary" ? (
            <label className="block space-y-2 text-sm text-primary">
              Explanation
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
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void saveQuestion()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </section>
    </div>
  );
}
