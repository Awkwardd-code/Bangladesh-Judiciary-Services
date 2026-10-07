"use client";

import { Check } from "lucide-react";

type ExamLifecycleBarProps = {
  status: "draft" | "published" | "archived";
  totalQuestions: number;
  requiredQuestions: number;
  hasCourse: boolean;
};

const stages = ["Create", "Add questions", "Reach target", "Publish", "Live"];

export function ExamLifecycleBar({
  status,
  totalQuestions,
  requiredQuestions,
  hasCourse,
}: ExamLifecycleBarProps) {
  const completed = [
    true,
    totalQuestions > 0,
    totalQuestions >= requiredQuestions,
    status === "published",
    status === "published" && totalQuestions >= requiredQuestions,
  ];
  const currentIndex = completed.findIndex((isComplete) => !isComplete);

  return (
    <nav
      aria-label="Exam lifecycle"
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <ol className="grid gap-3 sm:grid-cols-5 sm:gap-0">
        {stages.map((stage, index) => {
          const isComplete = completed[index];
          const isCurrent = index === currentIndex;

          return (
            <li
              key={stage}
              className="relative flex items-center gap-3 sm:flex-col sm:gap-2"
            >
              {index < stages.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-8 hidden w-full border-t border-border sm:block"
                />
              ) : null}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isComplete
                    ? "bg-primary text-cream"
                    : isCurrent
                      ? "bg-accent text-cream ring-2 ring-accent/30"
                      : "bg-primary/10 text-muted"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="text-xs text-muted sm:text-center">
                {stage}
                {index === 1 && !hasCourse && requiredQuestions > 0
                  ? " · optional course"
                  : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
