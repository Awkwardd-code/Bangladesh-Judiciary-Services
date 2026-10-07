"use client";

import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
type ExamEditorProps = {
  exam?: {
    _id: string;
    title: string;
    description?: string;
    durationMinutes: number;
    questionsPerAttempt?: number;
    negativeMarking?: number;
    scheduledAt?: Date | string;
    closesAt?: Date | string;
  };
  onSaved: () => void;
  onCancel?: () => void;
};

type ExamForm = {
  title: string;
  description: string;
  durationMinutes: string;
  questionsPerAttempt: string;
  negativeMarking: string;
  scheduledAt: string;
  closesAt: string;
};

const emptyForm: ExamForm = {
  title: "",
  description: "",
  durationMinutes: "180",
  questionsPerAttempt: "",
  negativeMarking: "0",
  scheduledAt: "",
  closesAt: "",
};

function toLocalDateTime(value?: Date | string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function ExamEditor({ exam, onSaved, onCancel }: ExamEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [savedForm, setSavedForm] = useState<ExamForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  );

  useEffect(() => {
    const nextForm = exam
      ? {
          title: exam.title,
          description: exam.description ?? "",
          durationMinutes: String(exam.durationMinutes),
          questionsPerAttempt: String(exam.questionsPerAttempt ?? ""),
          negativeMarking: String(exam.negativeMarking ?? 0),
          scheduledAt: toLocalDateTime(exam.scheduledAt),
          closesAt: toLocalDateTime(exam.closesAt),
        }
      : emptyForm;

    setForm(nextForm);
    setSavedForm(nextForm);
    setError("");
  }, [exam]);

  const duration = Number(form.durationMinutes);
  const questionsPerAttempt = Number(form.questionsPerAttempt);
  const negativeMarking = Number(form.negativeMarking);
  const scheduleValid =
    !form.scheduledAt ||
    !form.closesAt ||
    new Date(form.closesAt).getTime() > new Date(form.scheduledAt).getTime();
  const validationMessage =
    !form.title.trim() || form.title.trim().length < 3
      ? "Enter a title with at least 3 characters."
      : !Number.isInteger(duration) || duration < 1 || duration > 600
        ? "Duration must be between 1 and 600 minutes."
        : (form.questionsPerAttempt.trim() !== "" &&
              (!Number.isInteger(questionsPerAttempt) ||
                questionsPerAttempt < 1)) ||
            questionsPerAttempt > 500
          ? "Questions per attempt must be between 1 and 500."
          : !Number.isFinite(negativeMarking) ||
              negativeMarking < 0 ||
              negativeMarking > 2
            ? "Negative marking must be between 0 and 2."
            : !scheduleValid
              ? "Closing time must be later than the scheduled time."
              : "";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(validationMessage);

    if (validationMessage || saving) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: duration,
        questionsPerAttempt:
          form.questionsPerAttempt.trim() === ""
            ? undefined
            : questionsPerAttempt,
        negativeMarking,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : undefined,
        closesAt: form.closesAt
          ? new Date(form.closesAt).toISOString()
          : undefined,
      };
      const response = await fetch(
        exam
          ? `/api/admin/preliminary-exams/${exam._id}`
          : "/api/admin/preliminary-exams",
        {
          method: exam ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as {
        error?: string;
        data?: { exam?: { _id?: string } };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save this exam.");
      }

      setSavedForm(form);
      onSaved();
      toast("Exam saved.");
      router.push("/admin/mock-exams");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save this exam."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-primary">
            {exam ? "Edit model test" : "Create model test"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Save the exam as a draft, then add its questions before publishing.
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel exam editing"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <form onSubmit={save} className="mt-6 space-y-5">
        <label className="block space-y-2 text-sm font-semibold text-primary">
          Title
          <Input
            required
            minLength={3}
            maxLength={200}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
          <span className="block text-xs font-normal text-muted">
            Use a clear title students can recognize.
          </span>
        </label>

        <label className="block space-y-2 text-sm font-semibold text-primary">
          Description
          <Textarea
            rows={3}
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

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-primary">
            Duration (minutes)
            <Input
              type="number"
              min={1}
              max={600}
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                }))
              }
            />
            <span className="block text-xs font-normal text-muted">
              From 1 to 600 minutes.
            </span>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-primary">
            Questions per attempt
            <Input
              type="number"
              min={1}
              max={500}
              value={form.questionsPerAttempt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  questionsPerAttempt: event.target.value,
                }))
              }
            />
            <span className="block text-xs font-normal text-muted">
              Leave blank to serve all exam questions.
            </span>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-primary">
            Negative marking
            <Input
              type="number"
              min={0}
              max={2}
              step={0.25}
              value={form.negativeMarking}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  negativeMarking: event.target.value,
                }))
              }
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-primary">
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
            <span className="block text-xs font-normal text-muted">
              Leave blank to make the exam available immediately.
            </span>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-primary sm:col-span-2">
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

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <footer className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving} className="cursor-pointer">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save draft"}
            </Button>
          </div>
        </footer>
      </form>
    </section>
  );
}
