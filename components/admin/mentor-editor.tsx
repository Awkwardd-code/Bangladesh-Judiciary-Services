"use client";

import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ImageUploader } from "@/components/ui/image-uploader";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MentorRecord } from "@/lib/types/mentor";

type MentorEditorProps = {
  mentor?: MentorRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type MentorForm = {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  photoPublicId: string;
  specializations: string[];
  yearsOfExperience: number;
  order: number;
  isPublished: boolean;
};

const emptyForm: MentorForm = {
  name: "",
  title: "",
  bio: "",
  photoUrl: "",
  photoPublicId: "",
  specializations: [],
  yearsOfExperience: 0,
  order: 0,
  isPublished: true,
};

export function MentorEditor({
  mentor,
  open,
  onOpenChange,
  onSaved,
}: MentorEditorProps) {
  const [form, setForm] = useState<MentorForm>(emptyForm);
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({ name: false, title: false, bio: false });

  useEffect(() => {
    setForm(
      mentor
        ? {
            name: mentor.name,
            title: mentor.title,
            bio: mentor.bio,
            photoUrl: mentor.photoUrl,
            photoPublicId: mentor.photoPublicId,
            specializations: mentor.specializations ?? [],
            yearsOfExperience: mentor.yearsOfExperience,
            order: mentor.order,
            isPublished: mentor.isPublished,
          }
        : emptyForm,
    );
    setSpecialization("");
    setError("");
    setTouched({ name: false, title: false, bio: false });
  }, [mentor, open]);

  if (!open) {
    return null;
  }

  function updateForm<Key extends keyof MentorForm>(
    key: Key,
    value: MentorForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addSpecialization() {
    const value = specialization.trim();

    if (value.length < 2 || value.length > 80) {
      setError("Each specialization must be between 2 and 80 characters.");
      return;
    }

    if (form.specializations.length >= 10) {
      setError("Add no more than 10 specializations.");
      return;
    }

    updateForm("specializations", [...form.specializations, value]);
    setSpecialization("");
    setError("");
  }

  function validate() {
    if (form.name.trim().length < 2) {
      return "Enter a name with at least 2 characters.";
    }
    if (form.title.trim().length < 2) {
      return "Enter a title with at least 2 characters.";
    }
    if (form.bio.trim().length < 10) {
      return "Enter a bio with at least 10 characters.";
    }
    if (!form.photoUrl || !form.photoPublicId) {
      return "Upload a photo before saving.";
    }
    if (form.specializations.length < 1) {
      return "Add at least one specialization.";
    }

    return "";
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, title: true, bio: true });
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        mentor ? `/api/admin/mentors/${mentor.id}` : "/api/admin/mentors",
        {
          method: mentor ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save mentor.");
      }

      onOpenChange(false);
      onSaved();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save mentor.",
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
        aria-labelledby="mentor-editor-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="mentor-editor-title"
              className="font-heading text-xl font-bold text-primary"
            >
              {mentor ? "Edit mentor" : "Add mentor"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Mentor details are shown on the public site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close mentor editor"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={save} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">
              Photo <span className="text-red-600">*</span>
            </label>
            <ImageUploader
              key={`${mentor?.id ?? "new"}-${form.photoUrl}`}
              value={form.photoUrl || null}
              publicId={form.photoPublicId || null}
              onChange={(image) => {
                updateForm("photoUrl", image.url ?? "");
                updateForm("photoPublicId", image.publicId ?? "");
              }}
              folder="bjs-prep/mentors"
              aspect="square"
              helperText="JPEG, PNG, or WebP. Maximum 5 MB."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-primary">
              Name
              <Input
                required
                minLength={2}
                maxLength={120}
                value={form.name}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                onChange={(event) => updateForm("name", event.target.value)}
              />
              {touched.name && form.name.trim().length < 2 ? (
                <p className="text-xs text-red-600">Name must be 2+ characters.</p>
              ) : null}
            </label>
            <label className="space-y-2 text-sm font-medium text-primary">
              Title
              <Input
                required
                minLength={2}
                maxLength={160}
                placeholder="Professor, Department of Law"
                value={form.title}
                onBlur={() => setTouched((current) => ({ ...current, title: true }))}
                onChange={(event) => updateForm("title", event.target.value)}
              />
              {touched.title && form.title.trim().length < 2 ? (
                <p className="text-xs text-red-600">Title must be 2+ characters.</p>
              ) : null}
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-primary">
            Bio
            <Textarea
              required
              minLength={10}
              rows={6}
              maxLength={2000}
              value={form.bio}
              onBlur={() => setTouched((current) => ({ ...current, bio: true }))}
              onChange={(event) => updateForm("bio", event.target.value)}
            />
            {touched.bio && form.bio.trim().length < 10 ? (
              <p className="text-xs text-red-600">Bio must be 10+ characters.</p>
            ) : null}
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-primary">
              Specializations
            </legend>
            <div className="mt-2 flex gap-2">
              <Input
                value={specialization}
                maxLength={80}
                onChange={(event) => setSpecialization(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSpecialization();
                  }
                }}
                placeholder="Add a specialization"
                aria-label="New specialization"
              />
              <ButtonWithIcon
                type="button"
                icon={Plus}
                onClick={addSpecialization}
                disabled={form.specializations.length >= 10}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                Add
              </ButtonWithIcon>
            </div>
            {form.specializations.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {form.specializations.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-primary"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "specializations",
                          form.specializations.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      aria-label={`Remove ${item}`}
                      className="cursor-pointer text-muted hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-primary">
              Years of experience
              <Input
                type="number"
                min={0}
                max={80}
                value={form.yearsOfExperience}
                onChange={(event) =>
                  updateForm("yearsOfExperience", Number(event.target.value))
                }
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-primary">
              Display order
              <Input
                type="number"
                min={0}
                max={9999}
                value={form.order}
                onChange={(event) =>
                  updateForm("order", Number(event.target.value))
                }
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-primary">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                updateForm("isPublished", event.target.checked)
              }
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            Publish this mentor
          </label>

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
              className="text-muted hover:text-primary"
            >
              Cancel
            </ButtonWithIcon>
            <ButtonWithIcon
              type="submit"
              icon={Save}
              disabled={saving}
              className="rounded-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save mentor"}
            </ButtonWithIcon>
          </footer>
        </form>
      </section>
    </div>
  );
}