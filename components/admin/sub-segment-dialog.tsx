"use client";

import { Check, Download, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import type { SerializedSubSegment, SubSegmentKind } from "@/lib/types/course";

const defaultKind: SubSegmentKind = "lecture";

function makeEmptySubSegment(kind: SubSegmentKind = defaultKind): SerializedSubSegment {
  return {
    _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "",
    description: "",
    order: 0,
    kind,
    isFree: false,
    examIds: [],
    payload: {},
  };
}

export function SubSegmentDialog({
  open,
  courseSlug,
  subSegment,
  onSave,
  onClose,
}: {
  open: boolean;
  courseSlug: string;
  subSegment: SerializedSubSegment | null;
  onSave: (data: SerializedSubSegment) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<SerializedSubSegment>(
    subSegment ?? makeEmptySubSegment(),
  );
  const [uploading, setUploading] = useState(false);
  const [isPasteUrl, setIsPasteUrl] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(subSegment ?? makeEmptySubSegment());
      setIsPasteUrl(false);
    }
  }, [open, subSegment]);

  if (!open) {
    return null;
  }

  function updatePayload(patch: Partial<SerializedSubSegment["payload"]>) {
    setForm((current) => ({
      ...current,
      payload: {
        ...current.payload,
        ...patch,
      },
    }));
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToCloudinary(
        file,
        `bjs-prep/courses/${courseSlug}/materials`,
        "raw",
      );

      updatePayload({
        pdfUrl: result.secureUrl,
        pdfPublicId: result.publicId,
        sizeBytes: result.bytes,
        mimeType: file.type || "application/pdf",
        materialType: file.name.toLowerCase().endsWith(".book")
          ? "book"
          : "slides",
      });
    } catch (error) {
      console.error("Upload sub-segment file error", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function save() {
    const next = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      payload: {
        ...form.payload,
        videoUrl: form.payload.videoUrl?.trim(),
        thumbnailUrl: form.payload.thumbnailUrl?.trim(),
        link: form.payload.link?.trim(),
        recordingUrl: form.payload.recordingUrl?.trim(),
        pdfUrl: form.payload.pdfUrl?.trim(),
      },
    };

    if (!next.title) {
      return;
    }

    onSave(next);
  }

  const isPdfKind = form.kind === "note" || form.kind === "material";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-2">
          <h3 className="font-heading text-xl font-semibold text-primary">
            {subSegment ? "Edit content item" : "Add content item"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Title</label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Description
            </label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Kind</label>
              <Select
                value={form.kind}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    kind: event.target.value as SubSegmentKind,
                    payload: {},
                  }))
                }
              >
                <option value="lecture">Class Lecture</option>
                <option value="video">Video</option>
                <option value="live">Live</option>
                <option value="note">Class Note</option>
                <option value="material">Material</option>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-8">
              <Checkbox
                checked={form.isFree}
                onCheckedChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    isFree: Boolean(value),
                  }))
                }
              />
              <span className="text-sm text-muted">Free item</span>
            </div>
          </div>

          {form.kind === "lecture" || form.kind === "video" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  Video URL
                </label>
                <Input
                  value={form.payload.videoUrl ?? ""}
                  onChange={(event) =>
                    updatePayload({ videoUrl: event.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Duration minutes
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.payload.durationMinutes ?? 0}
                    onChange={(event) =>
                      updatePayload({
                        durationMinutes: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Thumbnail URL
                  </label>
                  <Input
                    value={form.payload.thumbnailUrl ?? ""}
                    onChange={(event) =>
                      updatePayload({ thumbnailUrl: event.target.value })
                    }
                  />
                </div>
              </div>
            </>
          ) : null}

          {form.kind === "live" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Link</label>
                <Input
                  value={form.payload.link ?? ""}
                  onChange={(event) => updatePayload({ link: event.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Scheduled at
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.payload.scheduledAt ?? ""}
                    onChange={(event) =>
                      updatePayload({ scheduledAt: event.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Duration minutes
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.payload.durationMinutes ?? 0}
                    onChange={(event) =>
                      updatePayload({
                        durationMinutes: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  Recording URL
                </label>
                <Input
                  value={form.payload.recordingUrl ?? ""}
                  onChange={(event) =>
                    updatePayload({ recordingUrl: event.target.value })
                  }
                />
              </div>
            </>
          ) : null}

          {isPdfKind ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border bg-background p-4">
              {form.payload.pdfUrl ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Download className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-primary">
                        {form.payload.pdfUrl.split("/").pop() ?? "File"}
                      </div>
                      <div className="text-xs text-muted">
                        {form.payload.sizeBytes
                          ? `${Math.max(1, Math.round(form.payload.sizeBytes / 1024))} KB`
                          : "Uploaded"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer text-sm text-primary hover:text-accent"
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <>
                  {isPasteUrl ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary">
                        PDF URL
                      </label>
                      <Input
                        value={form.payload.pdfUrl ?? ""}
                        onChange={(event) =>
                          updatePayload({ pdfUrl: event.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Upload className="h-4 w-4" />
                        PDF up to 25 MB
                      </div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleUpload}
                      />
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-primary"
                        onClick={() => inputRef.current?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload PDF
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className="text-sm text-primary underline underline-offset-2"
                    onClick={() => setIsPasteUrl((current) => !current)}
                  >
                    {isPasteUrl ? "Upload file" : "Paste URL"}
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={save}>
            <Check className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
