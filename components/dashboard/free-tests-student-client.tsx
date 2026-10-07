"use client";

import {
  AlertTriangle,
  Clock3,
  FileText,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { plural } from "@/lib/pluralize";

type FreeTestListItem = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  preliminaryDurationMinutes: number;
  writtenDurationMinutes: number;
  writtenQuestionsPerAttempt: number;
  preliminaryQuestionCount: number;
  writtenQuestionCount: number;
  usesPhases: boolean;
  passMarkPercent: number;
  questionsPerAttempt: number;
  totalQuestions: number;
  totalMarks: number;
};

type AccessState = {
  freeAttemptsUsed: number;
  freeAttemptsLimit: number;
  freeAttemptsLeft: number;
  locked: boolean;
};

type ActiveExamState = {
  examId: string;
  kind: "preliminary" | "written" | "free";
};

type AttemptMap = Record<
  string,
  { attempts: number; bestScore: number | null }
>;

export function FreeTestsStudentClient({
  freeTests,
  access,
  activeExam,
  attemptMap,
}: {
  freeTests: FreeTestListItem[];
  access: AccessState;
  activeExam: ActiveExamState | null;
  attemptMap: AttemptMap;
}) {
  const used = Number(access.freeAttemptsUsed ?? 0);
  const limit = Number(access.freeAttemptsLimit ?? 10);
  const remaining = Number(
    access.freeAttemptsLeft ?? Math.max(0, limit - used)
  );
  const progress = limit > 0 ? (used / limit) * 100 : 0;

  const quotaTone =
    remaining === 0
      ? "border-red-200 bg-red-100 text-red-700"
      : remaining <= 3
        ? "border-amber-200 bg-amber-100 text-amber-700"
        : "border-emerald-200 bg-emerald-100 text-emerald-700";

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Free Model Tests
        </h1>
        <p className="text-base text-muted">
          Curated question sets to test your preparation. Each attempt is drawn
          fresh from the question pool.
        </p>
      </div>

      {activeExam ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-primary">
                  You have an exam in progress.
                </p>
                <p className="text-sm text-muted">
                  {activeExam.kind === "free" ? "Free model test" : "Mock exam"}
                </p>
              </div>
            </div>

            <Link
              href={
                activeExam.kind === "free"
                  ? `/dashboard/free-tests/${activeExam.examId}`
                  : `/dashboard/mock-exams/${activeExam.examId}`
              }
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream transition hover:bg-primary-dark"
            >
              Resume exam
            </Link>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Free attempts
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              {used} of {limit} used
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${quotaTone}`}
          >
            {remaining} attempts left
          </span>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {access.locked ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center text-red-600">
            <Lock className="h-12 w-12" />
          </div>
          <h2 className="font-heading text-2xl font-semibold text-primary">
            You&apos;ve used all 10 free attempts.
          </h2>
          <p className="mt-3 text-sm text-muted">
            Enroll in a paid course to continue practicing with unlimited model
            tests.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm text-cream transition hover:bg-primary-dark"
            >
              Browse courses
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-5 text-sm text-foreground transition hover:bg-muted/5"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : freeTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mb-3 flex justify-center text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-primary">
            No free tests available yet.
          </h2>
          <p className="mt-2 text-sm text-muted">Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {freeTests.map((freeTest) => {
            const stats = attemptMap[freeTest.id];
            const attempts = stats?.attempts ?? 0;
            const bestScore =
              typeof stats?.bestScore === "number" ? stats.bestScore : null;
            const preliminaryServed =
              freeTest.preliminaryQuestionCount === 0
                ? 0
                : freeTest.questionsPerAttempt > 0
                  ? Math.min(
                      freeTest.questionsPerAttempt,
                      freeTest.preliminaryQuestionCount
                    )
                  : freeTest.preliminaryQuestionCount;
            const writtenServed =
              freeTest.writtenQuestionCount === 0
                ? 0
                : freeTest.writtenQuestionsPerAttempt > 0
                  ? Math.min(
                      freeTest.writtenQuestionsPerAttempt,
                      freeTest.writtenQuestionCount
                    )
                  : freeTest.writtenQuestionCount;
            const effectiveServed = preliminaryServed + writtenServed;
            const servesAll = effectiveServed >= freeTest.totalQuestions;

            return (
              <div
                key={freeTest.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700">
                    Free
                  </span>

                  <span className="text-xs text-muted">
                    {attempts} attempts
                  </span>
                </div>

                <h2 className="font-heading text-lg font-semibold text-primary">
                  {freeTest.title}
                </h2>

                <p className="line-clamp-2 text-sm text-muted">
                  {freeTest.description || "Practice with a fresh model test."}
                </p>

                {freeTest.totalQuestions === 0 ? (
                  <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    Not ready yet
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/5 px-2 py-1">
                      <FileText className="h-3.5 w-3.5" />
                      {plural(freeTest.totalQuestions, "question")} in pool
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/5 px-2 py-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {plural(effectiveServed, "question")} per attempt
                      {servesAll ? (
                        <span className="text-muted">(all)</span>
                      ) : null}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/5 px-2 py-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {freeTest.usesPhases
                        ? `Preliminary ${freeTest.preliminaryDurationMinutes} min · Written ${freeTest.writtenDurationMinutes} min`
                        : `${freeTest.durationMinutes} min`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/5 px-2 py-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {freeTest.passMarkPercent}% to pass
                    </span>
                  </div>
                )}

                {freeTest.totalQuestions === 1 ? (
                  <p className="text-xs font-medium text-amber-700">
                    This test has only 1 question.
                  </p>
                ) : null}

                {bestScore !== null ? (
                  <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Best: {bestScore}%
                  </span>
                ) : null}

                <div className="mt-auto pt-2">
                  {freeTest.totalQuestions === 0 ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-cream opacity-60"
                    >
                      Start
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/free-tests/${freeTest.id}`}
                      className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-cream transition hover:bg-primary-dark"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
