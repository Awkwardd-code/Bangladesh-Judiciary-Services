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
    <footer className="mt-6 border-t border-border bg-background/60 px-4 py-4 sm:mt-8 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs leading-5 text-muted sm:text-left">
          {isPhaseTransition
            ? "Your preliminary answers will be submitted before the next phase."
            : "Review your answers before submitting."}
        </p>
        <button
          type="button"
          onClick={isPhaseTransition ? onPhaseSubmit : onSubmit}
          disabled={submitting || phaseSubmitting}
          className="
            inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2
            rounded-xl bg-primary px-5 text-sm font-semibold text-cream shadow-sm
            hover:bg-primary-dark disabled:cursor-not-allowed
            disabled:opacity-60 sm:w-auto sm:px-8
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
