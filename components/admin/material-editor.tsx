"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Loader2, Upload } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import type { MaterialKind } from "@/lib/types/material";

export type EditableMaterial = {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  kind: MaterialKind;
  url: string;
  publicId?: string;
  sizeBytes?: number;
  isFreePreview: boolean;
  order: number;
};

type MaterialEditorProps = {
  courseId: string;
  material?: EditableMaterial | null;
  onSaved: (material: EditableMaterial) => void;
  onCancel: () => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type MaterialForm = {
  title: string;
  description: string;
  kind: MaterialKind;
  url: string;
  publicId: string;
  sizeBytes?: number;
  fileName: string;
  isFreePreview: boolean;
  order: number;
};

const maxFileSize = 20 * 1024 * 1024;

export function MaterialEditor({
  courseId,
  material,
  onSaved,
  onCancel,
  trigger,
  open,
  onOpenChange,
}: MaterialEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isOpen = open ?? internalOpen;
  const [form, setForm] = useState<MaterialForm>(() => makeForm(material));

  useEffect(() => {
    if (isOpen) setForm(makeForm(material));
  }, [isOpen, material]);

  function changeOpen(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) onCancel();
  }

  async function uploadFile(file: File) {
    const validExtension =
      form.kind === "pdf"
        ? /\.pdf$/i.test(file.name)
        : /\.(doc|docx)$/i.test(file.name);

    if (!validExtension) {
      toast(
        form.kind === "pdf"
          ? "Choose a PDF file."
          : "Choose a DOC or DOCX file.",
        "error",
      );
      return;
    }
    if (file.size > maxFileSize) {
      toast("Files must be 20 MB or smaller.", "error");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(
        file,
        `bjs-prep/course-materials/${courseId}`,
        "raw",
      );
      setForm((current) => ({
        ...current,
        url: result.secureUrl,
        publicId: result.publicId,
        sizeBytes: result.bytes,
        fileName: file.name,
      }));
      toast("File uploaded.");
    } catch (error) {
      console.error("Upload course material error", error);
      toast(
        error instanceof Error ? error.message : "Unable to upload this file.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploadFile(file);
  }

  async function save() {
    if (form.title.trim().length < 2) {
      toast("Title must be at least 2 characters.", "error");
      return;
    }
    if (!form.url) {
      toast(
        form.kind === "link" ? "Enter a valid URL." : "Upload a file first.",
        "error",
      );
      return;
    }
    if (uploading || saving) return;

    setSaving(true);
    try {
      const payload = {
        ...(material ? {} : { courseId }),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        kind: form.kind,
        url: form.url,
        publicId: form.publicId,
        sizeBytes: form.sizeBytes ?? 0,
        isFreePreview: form.isFreePreview,
        order: form.order,
      };
      const response = await fetch(
        material
          ? `/api/admin/courses/${courseId}/materials/${material._id}`
          : `/api/admin/courses/${courseId}/materials`,
        {
          method: material ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to save material.");
      }

      const saved = {
        ...result.data.material,
        _id: String(result.data.material._id),
        courseId: String(result.data.material.courseId),
      } as EditableMaterial;
      toast(material ? "Material updated." : "Material added.");
      onSaved(saved);
      changeOpen(false);
    } catch (error) {
      console.error("Save course material error", error);
      toast(
        error instanceof Error ? error.message : "Unable to save material.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {trigger ? (
        <span
          className="contents"
          onClick={() => changeOpen(true)}
          role="presentation"
        >
          {trigger}
        </span>
      ) : null}
      {isOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-primary-dark/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) changeOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="material-editor-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <header>
              <h2
                id="material-editor-title"
                className="font-heading text-xl font-semibold text-primary"
              >
                {material ? "Edit material" : "Add material"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Upload a PDF, attach a link, or add a document.
              </p>
            </header>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Title
                <input
                  maxLength={200}
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Description
                <Textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Kind
                <Select
                  value={form.kind}
                  onChange={(event) => {
                    const kind = event.target.value as MaterialKind;
                    setForm((current) => ({
                      ...current,
                      kind,
                      url: "",
                      publicId: "",
                      sizeBytes: undefined,
                      fileName: "",
                    }));
                  }}
                  className="mt-2 w-full"
                >
                  <option value="pdf">PDF</option>
                  <option value="link">Link</option>
                  <option value="doc">DOC</option>
                </Select>
              </label>

              {form.kind === "link" ? (
                <label className="block text-sm font-medium text-foreground">
                  URL
                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        url: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                  />
                </label>
              ) : (
                <div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={form.kind === "pdf" ? ".pdf" : ".doc,.docx"}
                    onChange={(event) => void handleFileChange(event)}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="
                      flex h-32 w-full cursor-pointer flex-col items-center
                      justify-center gap-2 rounded-md border border-dashed
                      border-border bg-background text-sm text-muted
                      disabled:cursor-wait disabled:opacity-60
                    "
                  >
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Upload size={20} />
                    )}
                    {form.fileName
                      ? `${form.fileName} · ${formatSize(form.sizeBytes)}`
                      : `Choose ${form.kind.toUpperCase()} file (max 20 MB)`}
                  </button>
                  {form.fileName ? (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="mt-2 cursor-pointer text-sm text-primary underline"
                    >
                      Replace file
                    </button>
                  ) : null}
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <Checkbox
                  checked={form.isFreePreview}
                  onCheckedChange={(isFreePreview) =>
                    setForm((current) => ({ ...current, isFreePreview }))
                  }
                />
                <span>
                  Free preview
                  <span className="mt-1 block text-xs text-muted">
                    Allow students without enrollment to download this material.
                  </span>
                </span>
              </label>

              <label className="block text-sm font-medium text-foreground">
                Order
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      order: Number(event.target.value),
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                />
              </label>
            </div>

            <footer className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => changeOpen(false)}
                className="h-10 cursor-pointer rounded-md border border-border px-4 text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || uploading}
                className="h-10 cursor-pointer rounded-md bg-primary px-4 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

function makeForm(material?: EditableMaterial | null): MaterialForm {
  return {
    title: material?.title ?? "",
    description: material?.description ?? "",
    kind: material?.kind ?? "pdf",
    url: material?.url ?? "",
    publicId: material?.publicId ?? "",
    sizeBytes: material?.sizeBytes,
    fileName: material?.url
      ? material.url.split("/").pop()?.split("?")[0] ?? ""
      : "",
    isFreePreview: material?.isFreePreview ?? false,
    order: material?.order ?? 0,
  };
}

function formatSize(sizeBytes?: number) {
  return sizeBytes ? `${(sizeBytes / 1024 / 1024).toFixed(1)} MB` : "Size unavailable";
}
