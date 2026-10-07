"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

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

  const targetPath =
    active.kind === "preliminary"
      ? `/dashboard/mock-exams/${active.examId}`
      : active.kind === "written"
        ? `/dashboard/mock-exams/written/${active.examId}`
        : `/dashboard/free-tests/${active.examId}`;

  const label =
    active.kind === "free" ? "Resume free test" : "Resume exam";

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-primary">
              {active.kind === "free"
                ? "You have a free test in progress."
                : "You have an exam in progress."}
            </p>
            <p className="text-sm text-muted">{examTitle}</p>
          </div>
        </div>

        <Link
          href={targetPath}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}
