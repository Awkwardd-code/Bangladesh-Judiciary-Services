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
  const totalQuestions = answeredCount + remainingCount;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <>
      <div className="bg-gradient-to-b from-primary/[0.04] to-transparent p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl text-center" aria-label="Exam paper heading">
          <span className="inline-flex rounded-full border border-primary/10 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent sm:text-xs">
            {kind} examination
          </span>
          <h1 className="mt-3 font-heading text-xl font-bold leading-tight text-primary sm:text-2xl lg:text-3xl">
            Bangladesh Judicial Service
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-[13px]">
            Judicial Service Examination — {sessionYear}
          </p>
        </div>

        <div className="mx-auto my-5 max-w-2xl border-t border-dashed border-border sm:my-6" />

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:text-xs">
            Examination paper
          </p>
          <h2 className="mt-2 break-words font-heading text-lg font-semibold leading-snug text-primary sm:text-xl lg:text-2xl">
            {examTitle}
          </h2>
        </div>

        <dl className="mx-auto mt-5 grid max-w-lg grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 text-center sm:p-4">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              Duration
            </dt>
            <dd className="mt-1 font-heading text-sm font-semibold text-primary sm:text-base">
              {durationMinutes} minutes
            </dd>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/80 p-3 text-center sm:p-4">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              Total Marks
            </dt>
            <dd className="mt-1 font-heading text-sm font-semibold text-primary sm:text-base">
              {totalMarks}
            </dd>
          </div>
        </dl>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-muted sm:mt-6 sm:text-[13px] sm:leading-6">
          Answer all questions. Each question carries the marks shown next to
          it. Do not use unfair means.
        </p>
      </div>

      <div className="sticky top-0 z-30 border-y border-border bg-card/95 px-3 py-2.5 shadow-md backdrop-blur sm:px-5 sm:py-3 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 items-center gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:text-xs">
              Time remaining
            </p>
            <p
              className={`
                mt-0.5 inline-flex items-center gap-1.5 font-mono text-base font-bold tabular-nums sm:mt-1 sm:gap-2 sm:text-xl
                ${timeLeftSeconds < 300 ? "animate-pulse text-red-600" : "text-primary"}
              `}
              role="timer"
              aria-live="off"
            >
              <Clock aria-hidden="true" size={16} className="sm:h-[18px] sm:w-[18px]" />
              {formatTime(timeLeftSeconds)}
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 sm:min-w-24 sm:gap-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <Check
              aria-hidden="true"
              size={16}
              className="shrink-0 text-emerald-600"
            />
            <div>
              <p className="text-[10px] text-muted sm:text-xs">Answered</p>
              <p className="font-mono text-sm font-semibold text-primary sm:mt-1 sm:text-base">
                {answeredCount}
                <span className="text-muted">/{totalQuestions}</span>
              </p>
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-1.5 sm:min-w-20 sm:justify-start sm:gap-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <FileQuestion
              aria-hidden="true"
              size={16}
              className="shrink-0 text-accent"
            />
            <div>
              <p className="text-[10px] text-muted sm:text-xs">Left</p>
              <p className="font-mono text-sm font-semibold text-primary sm:mt-1 sm:text-base">
                {remainingCount}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2 border-t border-border pt-2 sm:border-0 sm:pt-0 sm:text-right">
            <div className="flex items-center gap-2 sm:ml-auto">
              {phase ? (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium capitalize text-primary sm:px-3 sm:text-xs">
                  {phase}
                </span>
              ) : null}
              <span className="truncate text-[10px] capitalize text-muted sm:text-xs">
                {kind} exam
              </span>
            </div>
          </div>
        </div>
        <div
          className="mx-auto mt-2.5 h-1 max-w-5xl overflow-hidden rounded-full bg-primary/10 sm:mt-3"
          role="progressbar"
          aria-label="Exam completion"
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-valuenow={answeredCount}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </>
  );
}
