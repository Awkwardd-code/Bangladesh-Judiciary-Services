"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ExamReadinessCardProps = {
  totalQuestions: number;
  requiredQuestions: number;
  hasCourse: boolean;
  courseTitle?: string;
  readyToPublish?: boolean;
  readinessMessage?: string;
};

export function ExamReadinessCard({
  totalQuestions,
  requiredQuestions,
  hasCourse,
  courseTitle,
  readyToPublish,
  readinessMessage,
}: ExamReadinessCardProps) {
  const questionsReady = totalQuestions >= requiredQuestions;
  const ready = readyToPublish ?? questionsReady;
  const progress =
    requiredQuestions > 0
      ? Math.min(100, (totalQuestions / requiredQuestions) * 100)
      : 100;

  return (
    <section
      aria-live="polite"
      className={`rounded-xl border p-5 ${
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <div className="flex items-start gap-3">
        {ready ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-base font-semibold">
            {ready ? "Ready to publish." : "Almost there."}
          </h2>
          <p className="mt-1 text-sm">
            {ready
              ? "All question requirements are met."
              : readinessMessage ??
                `${totalQuestions} of ${requiredQuestions} ${
                  requiredQuestions === 1 ? "question" : "questions"
                } added.`}
          </p>
          <div
            role="progressbar"
            aria-label="Question readiness"
            aria-valuemin={0}
            aria-valuemax={requiredQuestions}
            aria-valuenow={Math.min(totalQuestions, requiredQuestions)}
            className="mt-3 h-2 overflow-hidden rounded-full bg-black/10"
          >
            <div
              className={`h-full rounded-full transition-all ${
                questionsReady ? "bg-emerald-600" : "bg-amber-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {!questionsReady ? (
            <p className="mt-2 text-xs">
              Add at least {requiredQuestions}{" "}
              {requiredQuestions === 1 ? "question" : "questions"} before
              publishing.
            </p>
          ) : null}
          {!hasCourse && requiredQuestions > 0 ? (
            <p className="mt-2 text-xs">
              {courseTitle
                ? `Course: ${courseTitle}`
                : "Course is not assigned (optional)."}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
