"use client";

import Link from "next/link";
import { ArrowRight, CirclePlay } from "lucide-react";

import type { ActiveExam } from "@/lib/types/exam";

export function ActiveExamBanner({
  active,
  examTitle,
}: {
  active: ActiveExam;
  examTitle: string;
}) {
  if (!active) {
    return null;
  }

  const targetPath = active.unified
    ? `/exam/${active.examId}`
    : active.kind === "preliminary"
      ? `/exam/preliminary/${active.examId}`
      : active.kind === "written"
        ? `/exam/written/${active.examId}`
        : `/exam/free/${active.examId}`;

  const label = active.kind === "free" ? "Resume free test" : "Resume exam";

  return (
    <section
      aria-label="Active exam"
      className="relative isolate overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CirclePlay aria-hidden="true" size={21} />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold text-primary">
              {active.kind === "free"
                ? "Free test in progress"
                : "Exam in progress"}
            </p>
            <p className="mt-1 text-sm leading-5 text-muted">{examTitle}</p>
            <p className="mt-1 text-xs text-amber-800">
              Your attempt is saved. Resume it to continue.
            </p>
          </div>
        </div>

        <Link
          href={targetPath}
          className="group inline-flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-cream transition hover:bg-primary-dark sm:w-auto"
        >
          {label}
          <ArrowRight
            aria-hidden="true"
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
