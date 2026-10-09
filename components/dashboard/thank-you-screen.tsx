"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExamKind = "preliminary" | "written" | "free";

type ThankYouScreenProps = {
  kind: ExamKind;
  examTitle: string;
  examId: string;
  resultHref: string;
  autoSubmitReason?: string | null;
  score?: number | null;
  passMarkPercent?: number | null;
};

const messageByKind: Record<ExamKind, (title: string) => string> = {
  preliminary: (title) =>
    `Your answers for "${title}" have been submitted. Your score will be available shortly.`,
  written: (title) =>
    `Your answer sheet for "${title}" has been received. Our mentors will review your submission within 24-48 hours.`,
  free: (title) =>
    `Your free model test "${title}" has been submitted. You can view your score right now.`,
};

const autoSubmitMessage: Record<string, string> = {
  "tab-change": "Auto-submitted: you switched tabs.",
  "time-expired": "Auto-submitted: the timer expired.",
  "visibility-hidden": "Auto-submitted: the window was hidden.",
};

export function ThankYouScreen({
  kind,
  examTitle,
  examId,
  resultHref,
  autoSubmitReason,
  score,
  passMarkPercent,
}: ThankYouScreenProps) {
  const autoMessage = autoSubmitReason
    ? autoSubmitMessage[autoSubmitReason]
    : undefined;

  return (
    <main
      data-exam-id={examId}
      className="
        flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background
        px-6 py-12
      "
    >
      <Card className="mx-auto w-full max-w-lg border-border bg-card p-8 text-center shadow-sm lg:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2
            aria-hidden="true"
            className="text-emerald-600"
            size={36}
          />
        </div>

        <h1 className="mt-6 font-heading text-2xl font-bold text-primary lg:text-3xl">
          Thank you.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {messageByKind[kind](examTitle)}
        </p>

        {score !== null && score !== undefined ? (
          <div className="mt-6 rounded-lg bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-widest text-muted">
              Your score
            </p>
            <p className="mt-1 font-heading text-3xl font-bold text-primary">
              {score}%
            </p>
            {passMarkPercent !== null && passMarkPercent !== undefined ? (
              <span
                className={`
                  mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    score >= passMarkPercent
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
              >
                {score >= passMarkPercent ? "Passed" : "Below pass mark"}
              </span>
            ) : null}
          </div>
        ) : null}

        {autoMessage ? (
          <p
            role="note"
            className="
              mt-4 flex items-center justify-center gap-2 rounded-md border
              border-amber-200 bg-amber-50 p-3 text-sm text-amber-900
            "
          >
            <AlertTriangle aria-hidden="true" size={16} />
            {autoMessage}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={resultHref}>
            View results
            <ArrowRight aria-hidden="true" size={16} />
          </Button>
          <Button
            href="/dashboard"
            variant="ghost"
            className="border border-border"
          >
            <Home aria-hidden="true" size={16} />
            Back to home
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted">
          You&apos;ll also receive a confirmation email.
        </p>
      </Card>
    </main>
  );
}
