"use client";

import { Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";

export type WrittenExamRecord = {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  status: "draft" | "published" | "archived";
  scheduledAt?: string;
  closesAt?: string;
};

type WrittenExamEditorProps = {
  exam?: WrittenExamRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type ExamForm = {
  title: string;
  description: string;
  durationMinutes: string;
  scheduledAt: string;
  closesAt: string;
};

const emptyForm: ExamForm = {
  title: "",
  description: "",
  durationMinutes: "180",
  scheduledAt: "",
  closesAt: "",
};

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function WrittenExamEditor({
  exam,
  open,
  onOpenChange,
  onSaved,
}: WrittenExamEditorProps) {
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({ title: false, durationMinutes: false });
  const duration = Number(form.durationMinutes);
  const scheduleValid =
    !form.scheduledAt ||
    !form.closesAt ||
    new Date(form.closesAt).getTime() > new Date(form.scheduledAt).getTime();
  const formValid =
    form.title.trim().length >= 3 &&
    Number.isInteger(duration) &&
    duration >= 1 &&
    duration <= 600 &&
    scheduleValid;

  useEffect(() => {
    setForm(
      exam
        ? {
            title: exam.title,
            description: exam.description ?? "",
            durationMinutes: String(exam.durationMinutes),
            scheduledAt: toDateTimeLocal(exam.scheduledAt),
            closesAt: toDateTimeLocal(exam.closesAt),
          }
        : emptyForm,
    );
    setError("");
    setTouched({ title: false, durationMinutes: false });
  }, [exam, open]);

  if (!open) {
    return null;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ title: true, durationMinutes: true });
    if (!formValid || saving) {
      setError("Check the highlighted exam fields.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
      scheduledAt: form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : undefined,
      closesAt: form.closesAt
        ? new Date(form.closesAt).toISOString()
        : undefined,
    };

    try {
      const response = await fetch(
        exam
          ? `/api/admin/written-exams/${exam._id}`
          : "/api/admin/written-exams",
        {
          method: exam ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save written exam.");
      }

      onOpenChange(false);
      onSaved();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save written exam.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="written-exam-editor-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="written-exam-editor-title"
              className="font-heading text-xl font-bold text-primary"
            >
              {exam ? "Edit written exam" : "New written exam"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Set exam details before adding written questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close written exam editor"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={save} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium text-primary">
            Title
            <Input
              required
              minLength={3}
              maxLength={200}
              value={form.title}
              onBlur={() => setTouched((current) => ({ ...current, title: true }))}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            {touched.title && form.title.trim().length < 3 ? (
              <p className="text-xs text-red-600">Title must be 3+ characters.</p>
            ) : null}
          </label>

          <label className="block space-y-2 text-sm font-medium text-primary">
            Description
            <Textarea
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
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
              required
              value={form.durationMinutes}
              onBlur={() =>
                setTouched((current) => ({ ...current, durationMinutes: true }))
              }
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                }))
              }
            />
            {touched.durationMinutes &&
            (!Number.isInteger(duration) || duration < 1 || duration > 600) ? (
              <p className="text-xs text-red-600">
                Duration must be between 1 and 600 minutes.
              </p>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-primary">
              Scheduled at
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-primary">
              Closes at
              <Input
                type="datetime-local"
                value={form.closesAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    closesAt: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          {!scheduleValid ? (
            <p className="text-xs text-red-600">
              Closing time must be after the scheduled start.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <footer className="flex justify-end gap-3 border-t border-border pt-4">
            <ButtonWithIcon
              type="button"
              icon={X}
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted"
            >
              Cancel
            </ButtonWithIcon>
            <ButtonWithIcon
              type="submit"
              icon={Save}
              disabled={saving || !formValid}
              className="rounded-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save exam"}
            </ButtonWithIcon>
          </footer>
        </form>
      </section>
    </div>
  );
}
