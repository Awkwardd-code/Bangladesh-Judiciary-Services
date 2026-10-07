"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  Lock,
  Layers,
  Target,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";

type ExamCardData = {
  id: string;
  kind: "preliminary" | "written" | "free";
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  questionsPerAttempt: number;
  totalMarks: number;
  passMarkPercent?: number;
  isFree: boolean;
  price: number;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  status: "draft" | "published" | "archived";
};

type ExamCardProps = {
  exam: ExamCardData;
  variant: "admin" | "public" | "student";
  attempt?: {
    attempts: number;
    bestScore: number | null;
  } | null;
  accessState?: "approved" | "pending" | "rejected" | "none" | null;
  actions?: ReactNode;
  href?: string;
  isLoggedIn?: boolean;
  subtitle?: string;
};

const kindLabels = {
  preliminary: "Preliminary",
  written: "Written",
  free: "Free model test",
};

function getExamHref(exam: ExamCardData) {
  if (exam.kind === "free") {
    return `/dashboard/free-tests/${exam.id}`;
  }

  if (exam.kind === "written") {
    return `/dashboard/mock-exams/written/${exam.id}`;
  }

  return `/dashboard/mock-exams/${exam.id}`;
}

export function ExamCard({
  exam,
  variant,
  attempt,
  accessState = "none",
  actions,
  href,
  isLoggedIn = false,
  subtitle,
}: ExamCardProps) {
  const defaultHref = href ?? getExamHref(exam);
  const accessAllowed = exam.isFree || accessState === "approved";
  const ctaHref =
    variant === "public" && !isLoggedIn
      ? `/login?next=${encodeURIComponent(defaultHref)}`
      : variant === "student" && !exam.isFree && !accessAllowed
        ? exam.courseSlug
          ? `/courses/${exam.courseSlug}`
          : "/courses"
        : defaultHref;
  const ctaLabel =
    variant === "admin"
      ? ""
      : variant === "public"
        ? isLoggedIn
          ? "Start"
          : "Login to start"
        : exam.isFree
          ? "Start"
          : accessState === "approved"
            ? "Start"
            : accessState === "pending"
              ? "Awaiting approval"
              : accessState === "rejected"
                ? "Access denied"
                : "Enroll to access";
  const disabled =
    variant === "student" &&
    !exam.isFree &&
    (accessState === "pending" || accessState === "rejected");
  const freeTestNotReady = exam.kind === "free" && exam.totalQuestions === 0;
  const effectiveServed =
    exam.questionsPerAttempt > 0
      ? exam.questionsPerAttempt
      : exam.totalQuestions;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            {kindLabels[exam.kind]}
          </span>
          {variant === "admin" ? (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                exam.status === "published"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : exam.status === "archived"
                    ? "border-border bg-muted/10 text-muted"
                    : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {exam.status}
            </span>
          ) : null}
        </div>
        {exam.isFree ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Free
          </span>
        ) : (
          <span className="font-heading text-base font-bold text-primary">
            BDT {exam.price.toLocaleString()}
          </span>
        )}
      </div>

      <h2 className="mt-4 line-clamp-2 font-heading text-lg font-semibold text-primary">
        {exam.title}
      </h2>

      {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}

      {exam.courseId ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          <span>From {exam.courseTitle ?? "course"}</span>
          {exam.courseSlug ? (
            <Link
              href={`/courses/${exam.courseSlug}`}
              className="cursor-pointer text-accent hover:underline"
            >
              View course →
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted">
        {exam.description || "Practice model test."}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        {exam.kind === "free" ? (
          <>
            {freeTestNotReady ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-800">
                Not ready yet
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {exam.totalQuestions} in pool
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {effectiveServed} served per attempt
              {exam.questionsPerAttempt > 0 &&
              exam.questionsPerAttempt < exam.totalQuestions ? (
                <span className="text-muted">(limited)</span>
              ) : null}
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {exam.questionsPerAttempt}{" "}
            {exam.questionsPerAttempt === 1 ? "question" : "questions"}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          {exam.durationMinutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" />
          {exam.totalMarks} marks
        </span>
        {exam.passMarkPercent ? (
          <span className="inline-flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {exam.passMarkPercent}% to pass
          </span>
        ) : null}
      </div>

      {variant === "student" ? (
        <div className="mt-3 text-xs">
          {attempt?.bestScore !== null && attempt?.bestScore !== undefined ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
              Best: {attempt.bestScore}%
            </span>
          ) : (
            <span className="text-muted">Not attempted yet</span>
          )}
        </div>
      ) : null}

      {variant === "student" && !exam.isFree && accessState !== "approved" ? (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-xs ${
            accessState === "pending"
              ? "bg-amber-50 text-amber-800"
              : accessState === "rejected"
                ? "bg-red-50 text-red-700"
                : "bg-muted/10 text-muted"
          }`}
        >
          {accessState === "pending"
            ? "Awaiting approval"
            : accessState === "rejected"
              ? "Access denied"
              : "Enroll to access"}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        {variant === "admin" ? (
          actions
        ) : disabled || freeTestNotReady ? (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md border border-border bg-muted/10 px-3 text-sm text-muted"
          >
            <Lock className="h-4 w-4" />
            {freeTestNotReady ? "Not ready yet" : ctaLabel}
          </button>
        ) : (
          <Link
            href={ctaHref}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm text-cream hover:bg-primary-dark"
          >
            {ctaLabel}
            {accessAllowed || variant === "public" ? (
              <ArrowRight className="h-4 w-4" />
            ) : null}
          </Link>
        )}
      </div>
    </article>
  );
}
