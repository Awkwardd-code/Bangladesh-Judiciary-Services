"use client";

import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type AdminSuccessStory = {
  id: string;
  authorName: string;
  authorEmail: string;
  authorUniversity: string;
  authorBatch: string;
  authorPhotoUrl?: string | null;
  authorPhotoPublicId?: string;
  quote: string;
  fullStory?: string | null;
  achievement: string;
  yearOfSelection?: number | null;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type StoryForm = {
  authorName: string;
  authorEmail: string;
  authorUniversity: string;
  authorBatch: string;
  authorPhotoUrl: string;
  authorPhotoPublicId: string;
  quote: string;
  fullStory: string;
  achievement: string;
  yearOfSelection: string;
  isFeatured: boolean;
  order: string;
};

const emptyForm: StoryForm = {
  authorName: "",
  authorEmail: "",
  authorUniversity: "",
  authorBatch: "",
  authorPhotoUrl: "",
  authorPhotoPublicId: "",
  quote: "",
  fullStory: "",
  achievement: "",
  yearOfSelection: "",
  isFeatured: false,
  order: "0",
};

type SuccessStoryEditorProps = {
  story?: AdminSuccessStory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function SuccessStoryEditor({
  story,
  open,
  onOpenChange,
  onSaved,
}: SuccessStoryEditorProps) {
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(
      story
        ? {
            authorName: story.authorName,
            authorEmail: story.authorEmail,
            authorUniversity: story.authorUniversity,
            authorBatch: story.authorBatch,
            authorPhotoUrl: story.authorPhotoUrl ?? "",
            authorPhotoPublicId: story.authorPhotoPublicId ?? "",
            quote: story.quote,
            fullStory: story.fullStory ?? "",
            achievement: story.achievement,
            yearOfSelection:
              story.yearOfSelection === null ||
              story.yearOfSelection === undefined
                ? ""
                : String(story.yearOfSelection),
            isFeatured: story.isFeatured,
            order: String(story.order),
          }
        : emptyForm,
    );
    setError("");
  }, [story, open]);

  if (!open) {
    return null;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      authorName: form.authorName.trim(),
      authorEmail: form.authorEmail.trim(),
      authorUniversity: form.authorUniversity.trim(),
      authorBatch: form.authorBatch.trim(),
      authorPhotoUrl: form.authorPhotoUrl || undefined,
      authorPhotoPublicId: form.authorPhotoPublicId || undefined,
      quote: form.quote.trim(),
      fullStory: form.fullStory.trim() || undefined,
      achievement: form.achievement.trim(),
      yearOfSelection: form.yearOfSelection
        ? Number(form.yearOfSelection)
        : undefined,
      isFeatured: form.isFeatured,
      order: Number(form.order) || 0,
    };

    try {
      const response = await fetch(
        story
          ? `/api/admin/success-stories/${story.id}`
          : "/api/admin/success-stories",
        {
          method: story ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save story.");
      }

      onOpenChange(false);
      onSaved();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save story.",
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
        aria-labelledby="success-story-editor-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="success-story-editor-title"
              className="font-heading text-xl font-bold text-primary"
            >
              {story ? "Edit story" : "Add story"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Admin-created stories are approved when saved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close story editor"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">
              Author photo{" "}
              <span className="font-normal text-muted">(optional)</span>
            </p>
            <ImageUploader
              key={`${story?.id ?? "new"}-${form.authorPhotoUrl}`}
              value={form.authorPhotoUrl || null}
              publicId={form.authorPhotoPublicId || null}
              onChange={(image) => {
                setForm((current) => ({
                  ...current,
                  authorPhotoUrl: image.url ?? "",
                  authorPhotoPublicId: image.publicId ?? "",
                }));
              }}
              folder="bjs-prep/success-stories"
              aspect="square"
              size={80}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Author name"
              value={form.authorName}
              maxLength={120}
              onChange={(value) => setForm({ ...form, authorName: value })}
            />
            <Field
              label="Email"
              type="email"
              value={form.authorEmail}
              onChange={(value) => setForm({ ...form, authorEmail: value })}
            />
            <Field
              label="University"
              value={form.authorUniversity}
              maxLength={160}
              onChange={(value) =>
                setForm({ ...form, authorUniversity: value })
              }
            />
            <Field
              label="Batch"
              value={form.authorBatch}
              maxLength={40}
              onChange={(value) => setForm({ ...form, authorBatch: value })}
            />
            <Field
              label="Year of selection"
              type="number"
              min={1990}
              max={2100}
              value={form.yearOfSelection}
              onChange={(value) => setForm({ ...form, yearOfSelection: value })}
            />
            <Field
              label="Achievement"
              value={form.achievement}
              maxLength={200}
              onChange={(value) => setForm({ ...form, achievement: value })}
            />
            <Field
              label="Display order"
              type="number"
              min={0}
              max={9999}
              value={form.order}
              onChange={(value) => setForm({ ...form, order: value })}
            />
          </div>

          <label className="block text-sm font-medium text-primary">
            Quote
            <Textarea
              required
              rows={3}
              minLength={10}
              maxLength={500}
              value={form.quote}
              onChange={(event) =>
                setForm({ ...form, quote: event.target.value })
              }
              className="mt-2"
            />
          </label>

          <label className="block text-sm font-medium text-primary">
            Full story
            <Textarea
              rows={8}
              maxLength={5000}
              value={form.fullStory}
              onChange={(event) =>
                setForm({ ...form, fullStory: event.target.value })
              }
              className="mt-2"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm({ ...form, isFeatured: event.target.checked })
              }
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            Feature this story
          </label>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <footer className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 cursor-pointer px-4 text-sm text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm font-medium text-cream disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save story"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block text-sm font-medium text-primary">
      {label}
      <Input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
        {...props}
      />
    </label>
  );
}
