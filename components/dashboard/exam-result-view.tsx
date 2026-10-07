"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  ResultQuestionCard,
  type ResultQuestion,
} from "@/components/dashboard/result-question-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type ResultAttempt = {
  id: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  submittedAt: string | null;
  autoSubmitReason?: string | null;
  passMarkPercent?: number | null;
  status?: string;
  feedback?: string | null;
  awaitingReview?: boolean;
};

export type ResultExam = {
  id: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
};

export function ExamResultView({
  attempt,
  exam,
  questions,
  kind,
  passed,
  phaseBreakdown,
}: {
  attempt: ResultAttempt;
  exam: ResultExam;
  questions: ResultQuestion[];
  kind: "preliminary" | "written" | "free";
  passed?: boolean;
  phaseBreakdown?: {
    preliminaryDurationMinutes: number;
    writtenDurationMinutes: number;
  };
}) {
  const isAwaitingReview =
    attempt.awaitingReview ||
    (kind === "written" && attempt.status !== "graded");
  const percentage =
    exam.totalMarks > 0
      ? Math.round((attempt.score / exam.totalMarks) * 100)
      : 0;
  const examList =
    kind === "free" ? "/dashboard/free-tests" : "/dashboard/mock-exams";
  const pass =
    passed ??
    (attempt.passMarkPercent != null
      ? percentage >= attempt.passMarkPercent
      : undefined);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/dashboard/results"
        className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to results
      </Link>

      <header>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          {exam.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Submitted {relativeTime(attempt.submittedAt)}</span>
          {attempt.autoSubmitReason &&
          attempt.autoSubmitReason !== "manual" ? (
            <Badge className="border-amber-200 bg-amber-50 text-amber-800">
              {autoSubmitLabel(attempt.autoSubmitReason)}
            </Badge>
          ) : null}
        </div>
      </header>

      {isAwaitingReview ? (
        <Card className="border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Your answer sheet is under review. You&apos;ll see your score once
          graded.
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col justify-center p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Score</p>
          <p className="mt-2 font-heading text-5xl font-bold text-primary">
            {isAwaitingReview ? "—" : `${percentage}%`}
          </p>
          {pass !== undefined && !isAwaitingReview ? (
            <Badge
              className={
                pass
                  ? "mt-3 w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "mt-3 w-fit border-red-200 bg-red-50 text-red-700"
              }
            >
              {pass ? "Passed" : "Not passed"}
            </Badge>
          ) : null}
          <p className="mt-2 text-sm text-muted">
            {attempt.score} / {exam.totalMarks} marks
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
          <StatCard label="Correct" value={attempt.correctCount} tone="success" />
          <StatCard label="Wrong" value={attempt.wrongCount} tone="danger" />
          <StatCard label="Skipped" value={attempt.skippedCount} tone="muted" />
        </div>
      </section>

      {phaseBreakdown ? (
        <Card className="p-5">
          <h2 className="font-heading font-semibold text-primary">
            Phase breakdown
          </h2>
          <div className="mt-3 flex flex-wrap gap-6 text-sm text-muted">
            <span>
              Preliminary: {phaseBreakdown.preliminaryDurationMinutes} min
            </span>
            <span>
              Written: {phaseBreakdown.writtenDurationMinutes} min
            </span>
          </div>
        </Card>
      ) : null}

      {attempt.feedback ? (
        <Card className="p-5">
          <h2 className="font-heading font-semibold text-primary">
            Examiner feedback
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
            {attempt.feedback}
          </p>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-primary">
          Question review
        </h2>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <ResultQuestionCard
              key={question.questionId}
              question={question}
              kind={kind}
              index={question.position ?? index}
            />
          ))
        ) : (
          <Card className="p-6 text-sm text-muted">
            No question details are available for this attempt.
          </Card>
        )}
      </section>

      <footer className="flex flex-wrap gap-3 pb-6">
        <Link
          href="/dashboard/results"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm text-primary"
        >
          <ArrowLeft size={16} />
          Back to results
        </Link>
        <Link
          href={examList}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm text-cream"
        >
          Take another exam
          <ArrowRight size={16} />
        </Link>
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-red-700"
        : "text-muted";
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

function relativeTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return date.toLocaleString("en");
  }
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : date.toLocaleDateString("en");
}

function autoSubmitLabel(reason: string) {
  if (reason === "tab-change") return "Auto-submitted: tab change";
  if (reason === "time-expired") return "Auto-submitted: time expired";
  if (reason === "visibility-hidden") return "Auto-submitted: window hidden";
  return "Auto-submitted";
}
