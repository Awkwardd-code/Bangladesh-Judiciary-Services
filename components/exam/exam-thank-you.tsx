"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Home,
} from "lucide-react";

import { Card } from "@/components/ui/card";

type ExamKind = "preliminary" | "written" | "free";

const messageByKind: Record<ExamKind, string> = {
  preliminary: "Your answers have been submitted successfully.",
  written: "Your answer sheet has been received for review.",
  free: "Your free model test has been submitted successfully.",
};

const autoSubmitMessage: Record<string, string> = {
  "tab-change":
    "This exam was submitted automatically after the window lost focus.",
  "visibility-hidden":
    "This exam was submitted automatically after the window was hidden.",
  "time-expired": "This exam was submitted automatically when time expired.",
};

export function ExamThankYou({
  kind,
  examTitle,
  resultHref,
  score,
  passMarkPercent,
  autoSubmitReason,
}: {
  kind: ExamKind;
  examTitle: string;
  resultHref: string;
  score?: number | null;
  passMarkPercent?: number | null;
  autoSubmitReason?: string | null;
}) {
  const autoMessage = autoSubmitReason
    ? autoSubmitMessage[autoSubmitReason]
    : undefined;
  const hasScore = score !== null && score !== undefined;
  const hasPassMark = passMarkPercent !== null && passMarkPercent !== undefined;
  const passed = hasScore && hasPassMark && score >= passMarkPercent;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl overflow-hidden rounded-2xl border-border bg-card shadow-[0_16px_50px_rgba(18,33,63,0.08)]">
        <div className="h-1.5 bg-accent" />
        <div className="p-6 sm:p-9 lg:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 aria-hidden="true" size={36} />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Submission complete
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-primary sm:text-4xl">
              Thank you
            </h1>
            <p className="mt-3 text-base font-medium text-primary">
              {examTitle}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
              {messageByKind[kind]}
              {kind === "written"
                ? " Our mentors will review your work and provide feedback."
                : ""}
            </p>
          </div>

          {hasScore ? (
            <section
              aria-label="Exam score"
              className="mt-7 rounded-xl border border-border bg-background/70 p-5 text-center sm:p-6"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted">
                <ClipboardCheck aria-hidden="true" size={17} />
                Your score
              </div>
              <p className="mt-2 font-heading text-5xl font-bold text-primary">
                {score}
                <span className="ml-1 text-2xl text-muted">%</span>
              </p>
              {hasPassMark ? (
                <span
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {passed ? (
                    <Check aria-hidden="true" size={14} />
                  ) : (
                    <AlertTriangle aria-hidden="true" size={14} />
                  )}
                  {passed ? "Passed" : "Not passed"} · Pass mark{" "}
                  {passMarkPercent}%
                </span>
              ) : null}
            </section>
          ) : null}

          {autoMessage ? (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900"
            >
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={17}
              />
              <p>{autoMessage}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-primary hover:bg-background"
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Back to dashboard
            </Link>
            <Link
              href={resultHref}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-cream hover:bg-primary-dark"
            >
              View results
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Home aria-hidden="true" size={14} />
            You may safely close this page after viewing your results.
          </p>
        </div>
      </Card>
    </main>
  );
}
