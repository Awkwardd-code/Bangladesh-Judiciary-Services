"use client";

import { Clock } from "lucide-react";

type ExamPaperHeaderProps = {
  examTitle: string;
  durationMinutes: number;
  totalMarks: number;
  sessionYear: string;
  kind: "preliminary" | "written" | "free";
  timeLeftSeconds: number;
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Time remaining</p>
            <p
              className={`
                mt-1 inline-flex items-center gap-2 font-mono text-xl font-semibold
                ${timeLeftSeconds < 300 ? "animate-pulse text-red-600" : "text-primary"}
              `}
              role="timer"
              aria-live="off"
            >
              <Clock aria-hidden="true" size={18} />
              {formatTime(timeLeftSeconds)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {phase ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                {phase}
              </span>
            ) : null}
            <span className="text-xs capitalize text-muted">{kind} exam</span>
          </div>
        </div>
      </div>
    </>
  );
}
