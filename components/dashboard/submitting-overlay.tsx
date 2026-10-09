"use client";

import { FileCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SkCircle, SkLine, SkTitle } from "@/components/skeletons/primitives";

type ExamKind = "preliminary" | "written" | "free";
type SubmitReason =
  "manual" | "tab-change" | "visibility-hidden" | "time-expired" | null;

const headingByKind: Record<ExamKind, string> = {
  preliminary: "Submitting your answers…",
  written: "Submitting your answer sheet…",
  free: "Submitting your test…",
};

function getNote(reason: SubmitReason) {
  if (reason === "time-expired") {
    return "Your time is up. We are submitting the answers you saved.";
  }

  if (reason === "tab-change" || reason === "visibility-hidden") {
    return "Auto-submitting because the window lost focus.";
  }

  return "Saving your answers. Please wait.";
}

export function SubmittingOverlay({
  kind,
  reason = null,
}: {
  kind: ExamKind;
  reason?: SubmitReason;
}) {
  const autoSubmitted = reason === "tab-change" || reason === "time-expired";

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label="Submitting exam"
      className="
        fixed inset-0 z-50 flex items-center justify-center
        pointer-events-auto bg-primary-dark/95 px-6 py-10 text-cream
        backdrop-blur-sm
      "
    >
      {autoSubmitted ? (
        <span
          className="
            absolute right-6 top-6 rounded-full border border-amber-300/30
            bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-amber-200
          "
        >
          Auto-submitted
        </span>
      ) : null}

      <div className="w-full max-w-xl text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden="true"
            className="
              absolute inset-0 animate-spin rounded-full border-4
              border-accent/30 border-t-accent
            "
          />
          <FileCheck aria-hidden="true" className="text-accent" size={28} />
        </div>

        <h2 className="mt-8 font-heading text-2xl font-bold text-cream">
          {headingByKind[kind]}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-cream/70">
          This usually takes a few seconds. Do not close this window.
        </p>

        <Card
          aria-hidden="true"
          className="
            mx-auto mt-8 rounded-lg border border-cream/10 bg-cream/5 p-6
            text-left shadow-none
          "
        >
          <SkCircle size="w-12 h-12" tone="dark" />
          <SkTitle width="w-48" height="h-6" tone="dark" className="mt-4" />
          <div className="mt-4 space-y-2">
            <SkLine width="w-full" height="h-3" tone="dark" />
            <SkLine width="w-5/6" height="h-3" tone="dark" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-md border border-cream/10 bg-cream/5 p-3"
              >
                <SkLine width="w-1/2" tone="dark" />
                <SkTitle width="w-3/4" tone="dark" className="mt-2" />
              </div>
            ))}
          </div>
        </Card>

        <p className="mt-8 text-xs text-cream/50">{getNote(reason)}</p>
      </div>
    </div>
  );
}
