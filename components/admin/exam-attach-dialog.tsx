"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function ExamAttachDialog({
  open,
  availableExams,
  selectedIds,
  onSave,
  onClose,
}: {
  open: boolean;
  availableExams: Array<{ id: string; title: string; kind?: string }>;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (open) {
      setDraftIds(selectedIds);
    }
  }, [open, selectedIds]);

  if (!open) {
    return null;
  }

  function toggleExam(id: string) {
    setDraftIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-2">
          <h3 className="font-heading text-xl font-semibold text-primary">
            Attach exams
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5"
            aria-label="Close exam picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {availableExams.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted">
              No published exams are available for this course yet.
            </div>
          ) : (
            availableExams.map((exam) => {
              const checked = draftIds.includes(exam.id);

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => toggleExam(exam.id)}
                  className={
                    checked
                      ? "flex w-full cursor-pointer items-center justify-between rounded-md border border-primary bg-primary/5 p-3 text-left"
                      : "flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-background p-3 text-left"
                  }
                >
                  <div>
                    <div className="font-medium text-primary">{exam.title}</div>
                    {exam.kind ? (
                      <div className="text-xs text-muted uppercase tracking-[0.12em]">
                        {exam.kind}
                      </div>
                    ) : null}
                  </div>

                  <Checkbox checked={checked} onCheckedChange={() => toggleExam(exam.id)} />
                </button>
              );
            })
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => {
            onSave(draftIds);
            onClose();
          }}>
            Save attachments
          </Button>
        </div>
      </div>
    </div>
  );
}
