"use client";

import { useState } from "react";
import { Download, FileText, Lock } from "lucide-react";

import { toast } from "@/components/ui/toaster";

type CourseNoteModule = {
  id: string;
  title: string;
  notes: Array<{
    id: string;
    title: string;
    description?: string;
    downloadable: boolean;
    hasAccess: boolean;
  }>;
};

export function CourseClassNotes({
  courseSlug,
  modules,
}: {
  courseSlug: string;
  modules: CourseNoteModule[];
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function downloadNote(noteId: string, title: string) {
    if (downloadingId) return;
    setDownloadingId(noteId);

    try {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/notes/${encodeURIComponent(noteId)}/download`,
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to download this class note.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${title.replace(/[\\/:*?"<>|]+/g, "-")}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (error) {
      console.error("Download class note error", error);
      toast(
        error instanceof Error
          ? error.message
          : "Unable to download this class note.",
        "error",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="mt-8 space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">
          Class notes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Download class notes from this course.
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted">
          No class notes are available for this course yet.
        </p>
      ) : (
        modules.map((module) => (
          <section key={module.id} className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-primary">
              {module.title}
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {module.notes.map((note) => (
                <li
                  key={note.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText
                      size={18}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-primary">{note.title}</p>
                      {note.description ? (
                        <p className="mt-1 text-sm text-muted">
                          {note.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {!note.hasAccess ? (
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm text-muted">
                      <Lock size={15} />
                      Enroll to access
                    </span>
                  ) : note.downloadable ? (
                    <button
                      type="button"
                      onClick={() => void downloadNote(note.id, note.title)}
                      disabled={downloadingId !== null}
                      className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm text-cream disabled:cursor-wait disabled:opacity-60"
                    >
                      <Download size={15} />
                      {downloadingId === note.id ? "Downloading…" : "Download"}
                    </button>
                  ) : (
                    <span className="text-sm text-muted">
                      File not available
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}
