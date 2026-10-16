"use client";

import { Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import {
  ExamSettingsField,
  ExamSettingsPanel,
} from "@/components/admin/exam-settings-panel";
type ExamEditorProps = {
  exam?: {
    _id: string;
    title: string;
    description?: string;
    courseId: string;
    segmentId: string;
    subSegmentId: string;
    kind: "preliminary" | "written";
    type?: "free" | "paid";
    price?: number;
    durationMinutes: number;
    questionsPerAttempt?: number;
    negativeMarking?: number;
    scheduledAt?: Date | string;
    closesAt?: Date | string;
  };
  courseId?: string;
  segmentId?: string;
  subSegmentId?: string;
  onSaved?: (id?: string) => void;
  onCancel?: () => void;
};

type ExamForm = {
  title: string;
  description: string;
  kind: "preliminary" | "written";
  type: "free" | "paid";
  price: string;
  durationMinutes: string;
  questionsPerAttempt: string;
  negativeMarking: string;
  scheduledAt: string;
  closesAt: string;
};

const emptyForm: ExamForm = {
  title: "",
  description: "",
  kind: "preliminary",
  type: "paid",
  price: "",
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

export function ExamEditor({
  exam,
  courseId,
  segmentId,
  subSegmentId,
  onSaved,
  onCancel,
}: ExamEditorProps) {
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
          kind: exam.kind,
          type: exam.type ?? "paid",
          price: String(exam.price ?? ""),
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
  const price = Number(form.price);
  const scheduleValid =
    !form.scheduledAt ||
    !form.closesAt ||
    new Date(form.closesAt).getTime() > new Date(form.scheduledAt).getTime();
  const validationMessage =
    !form.title.trim() || form.title.trim().length < 3
      ? "Enter a title with at least 3 characters."
      : !Number.isInteger(duration) || duration < 1 || duration > 600
        ? "Duration must be between 1 and 600 minutes."
        : form.type === "paid" &&
            (!Number.isFinite(price) ||
              (price <= 0 &&
                (!exam ||
                  form.type !== exam.type ||
                  price !== (exam.price ?? 0))))
          ? "Enter a price greater than zero for a paid exam."
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
        kind: form.kind,
        type: form.type,
        price: form.type === "free" ? 0 : price,
        courseId: exam?.courseId ?? courseId,
        segmentId: exam?.segmentId ?? segmentId,
        subSegmentId: exam?.subSegmentId ?? subSegmentId,
        durationMinutes: duration,
        questionsPerAttempt:
          form.questionsPerAttempt.trim() === ""
            ? 0
            : questionsPerAttempt,
        negativeMarking,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : exam
            ? null
            : undefined,
        closesAt: form.closesAt
          ? new Date(form.closesAt).toISOString()
          : exam
            ? null
            : undefined,
      };
      const response = await fetch(
        exam
          ? `/api/admin/exams/${exam._id}`
          : "/api/admin/exams",
        {
          method: exam ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            courseId,
            segmentId,
            subSegmentId,
          }),
        }
      );
      const result = (await response.json()) as {
        error?: string;
        data?: { exam?: { _id?: string }; id?: string; _id?: string };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save this exam.");
      }

      const createdId =
        result.data?.exam?._id ??
        result.data?.id ??
        result.data?._id ??
        undefined;

      setSavedForm(form);
      toast("Exam saved.");
      if (onSaved) {
        onSaved(createdId);
      } else {
        router.push("/admin/exams");
      }
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
    <ExamSettingsPanel
      onSubmit={save}
      saving={saving}
      error={error}
      description="Save the exam as a draft, then add its questions before publishing."
      saveLabel={exam ? "Save settings" : "Save draft"}
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="h-10 rounded-lg"
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving} className="h-10 rounded-lg">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : exam ? "Save settings" : "Save draft"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <ExamSettingsField label="Exam kind">
          <Select
            className="h-11 w-full"
            value={form.kind}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                kind: event.target.value as ExamForm["kind"],
              }))
            }
          >
            <option value="preliminary">Preliminary</option>
            <option value="written">Written</option>
          </Select>
        </ExamSettingsField>

        <ExamSettingsField label="Exam access">
          <Select
            className="h-11 w-full"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as ExamForm["type"],
              }))
            }
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Select>
        </ExamSettingsField>
        {form.type === "paid" ? (
          <ExamSettingsField label="Price (BDT)">
            <Input
              type="number"
              min={1}
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
            />
          </ExamSettingsField>
        ) : null}

        <ExamSettingsField label="Title" className="sm:col-span-2">
          <Input
            required
            minLength={3}
            maxLength={200}
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </ExamSettingsField>

        <ExamSettingsField label="Description" className="sm:col-span-2">
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
        </ExamSettingsField>

        <ExamSettingsField label="Duration (minutes)">
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
        </ExamSettingsField>

        <ExamSettingsField
          label="Questions per attempt"
          hint="Leave blank to serve all exam questions."
        >
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
        </ExamSettingsField>

        {form.kind === "preliminary" ? (
          <ExamSettingsField
            label="Negative marking"
            hint="Marks deducted for each incorrect answer."
          >
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
          </ExamSettingsField>
        ) : null}
        <ExamSettingsField
          label="Scheduled at"
          hint="Leave blank to make the exam available immediately."
        >
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
        </ExamSettingsField>

        <ExamSettingsField label="Closes at">
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
        </ExamSettingsField>
      </div>
    </ExamSettingsPanel>
  );
}
