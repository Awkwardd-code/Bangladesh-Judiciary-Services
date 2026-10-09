"use client";

import { ExamPaperSkeleton } from "@/components/exam/exam-paper-skeleton";

type SubmitReason =
  "manual" | "tab-change" | "visibility-hidden" | "time-expired" | null;

function noteForReason(reason?: SubmitReason) {
  if (reason === "time-expired") {
    return "Your time is up. Saving the answers you provided.";
  }

  if (reason === "tab-change" || reason === "visibility-hidden") {
    return "Auto-submitting because the window lost focus.";
  }

  return "Saving your answers. You’ll be redirected shortly.";
}

export function ExamSubmittingScreen({ reason }: { reason?: SubmitReason }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="pt-4">
        <ExamPaperSkeleton withTimer withFooter />
      </div>

      <p className="mx-auto mt-2 max-w-3xl px-6 pb-12 text-center text-sm text-muted">
        {noteForReason(reason)}
      </p>
    </main>
  );
}
