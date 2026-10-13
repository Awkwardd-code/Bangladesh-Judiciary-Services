"use client";

import { Check, Clock, FileQuestion } from "lucide-react";

type ExamPaperHeaderProps = {
  examTitle: string;
  durationMinutes: number;
  totalMarks: number;
  sessionYear: string;
  kind: "preliminary" | "written" | "free";
  timeLeftSeconds: number;
  answeredCount: number;
  remainingCount: number;
  phase?: "preliminary" | "written" | null;
};

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(remainder)}`;
}

export function ExamPaperHeader({
  examTitle,
  durationMinutes,
  totalMarks,
  sessionYear,
  kind,
  timeLeftSeconds,
  answeredCount,
  remainingCount,
  phase,
}: ExamPaperHeaderProps) {
  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="text-center" aria-label="Exam paper heading">
          <h1 className="font-heading text-2xl font-bold text-primary lg:text-3xl">
            Bangladesh Judicial Service
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Judicial Service Examination — {sessionYear}
          </p>
        </div>

        <div className="my-6 border-t border-dashed border-border" />

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted">Paper</p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-primary lg:text-2xl">
            {examTitle}
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Duration
            </p>
            <p className="mt-1 font-heading font-semibold text-primary">
              {durationMinutes} minutes
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted">
              Total Marks
            </p>
            <p className="mt-1 font-heading font-semibold text-primary">
              {totalMarks}
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-border" />

        <p className="text-[13px] leading-6 text-muted">
          Answer all questions. Each question carries the marks shown next to
          it. Do not use unfair means.
        </p>
      </div>

      <div className="sticky top-0 z-30 border-y border-border bg-card px-6 py-3 shadow-sm lg:px-8">
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs text-muted">Time remaining</p>
            <p
              className={`
                mt-1 inline-flex items-center gap-2 font-mono text-lg font-semibold sm:text-xl
                ${timeLeftSeconds < 300 ? "animate-pulse text-red-600" : "text-primary"}
              `}
              role="timer"
              aria-live="off"
            >
              <Clock aria-hidden="true" size={18} />
              {formatTime(timeLeftSeconds)}
            </p>
          </div>

          <div
            className="flex items-center gap-2 sm:min-w-28"
            aria-live="polite"
            aria-atomic="true"
          >
            <Check
              aria-hidden="true"
              size={17}
              className="shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-xs text-muted">Answered</p>
              <p className="mt-1 font-mono text-base font-semibold text-primary">
                {answeredCount}
              </p>
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-2 sm:min-w-28"
            aria-live="polite"
            aria-atomic="true"
          >
            <FileQuestion
              aria-hidden="true"
              size={17}
              className="shrink-0 text-accent"
            />
            <div>
              <p className="text-xs text-muted">Left</p>
              <p className="mt-1 font-mono text-base font-semibold text-primary">
                {remainingCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-2 sm:border-0 sm:pt-0 sm:text-right">
            <div className="flex items-center gap-2 sm:ml-auto">
              {phase ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                  {phase}
                </span>
              ) : null}
              <div>
                <span className="block text-xs capitalize text-muted">
                  {kind} exam
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
