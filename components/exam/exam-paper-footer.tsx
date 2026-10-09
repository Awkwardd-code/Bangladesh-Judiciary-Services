"use client";

import { Loader2, Send } from "lucide-react";

type ExamPaperFooterProps = {
  submitting: boolean;
  onSubmit: () => void;
  kind: "preliminary" | "written" | "free";
  onPhaseSubmit?: () => void;
  phaseSubmitting?: boolean;
  phaseSubmitLabel?: string;
};

export function ExamPaperFooter({
  submitting,
  onSubmit,
  kind,
  onPhaseSubmit,
  phaseSubmitting = false,
  phaseSubmitLabel,
}: ExamPaperFooterProps) {
  const isPhaseTransition = Boolean(onPhaseSubmit);

  return (
    <footer className="mt-8 border-t border-dashed border-border px-6 py-6 lg:px-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={isPhaseTransition ? onPhaseSubmit : onSubmit}
          disabled={submitting || phaseSubmitting}
          className="
            inline-flex h-12 cursor-pointer items-center justify-center gap-2
            rounded-md bg-primary px-6 text-sm font-semibold text-cream
            hover:bg-primary-dark disabled:cursor-not-allowed
            disabled:opacity-60 sm:px-8
          "
        >
          {submitting || phaseSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" size={18} />
              {phaseSubmitting ? "Starting written phase…" : "Submitting…"}
            </>
          ) : (
            <>
              <Send aria-hidden="true" size={17} />
              {isPhaseTransition
                ? phaseSubmitLabel
                : kind === "free"
                  ? "Submit test"
                  : "Submit exam"}
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
