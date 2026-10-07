"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

export type FreeTestQuestionClient = {
  id: string;
  position: number;
  source: "preliminary_questions" | "written_questions";
  questionText: string;
  options?: string[];
  marks: number;
  subject: string;
};

export type FreeTestAttemptClient = {
  id: string;
  startedAt: string;
  expiresAt: string;
  shuffledOrder: number[];
  answers: Array<{
    questionId: string;
    selectedOptionIndex: number | null;
    answeredAt: string | null;
  }>;
};

export function FreeTestClient({
  freeTest,
  attempt,
  questions,
}: {
  freeTest: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passMarkPercent: number;
    totalQuestions: number;
    totalMarks: number;
  };
  attempt: FreeTestAttemptClient | null;
  questions: FreeTestQuestionClient[] | null;
}) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(attempt?.id ?? null);
  const [expiresAt, setExpiresAt] = useState<string | null>(attempt?.expiresAt ?? null);
  const [questionList, setQuestionList] = useState<FreeTestQuestionClient[]>(
    questions ?? [],
  );
  const [answers, setAnswers] = useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};

    if (!attempt) {
      return initial;
    }

    for (const answer of attempt.answers) {
      initial[answer.questionId] = answer.selectedOptionIndex;
    }

    return initial;
  });
  const [locked, setLocked] = useState<Set<string>>(() => {
    if (!attempt) {
      return new Set();
    }

    return new Set(
      attempt.answers
        .filter((answer) => answer.selectedOptionIndex !== null)
        .map((answer) => answer.questionId),
    );
  });
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    if (!expiresAt) {
      return freeTest.durationMinutes * 60;
    }

    return Math.max(
      0,
      Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
    );
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(!attempt);
  const [readRules, setReadRules] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState<string | null>(null);
  const [submitBannerOpen, setSubmitBannerOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null).length,
    [answers],
  );

  useEffect(() => {
    if (!attempt || !attempt.expiresAt) {
      return undefined;
    }

    const tick = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000),
      );

      setTimeLeftSeconds(remaining);

      if (remaining <= 0 && !submitted && !isSubmittingRef.current) {
        void handleSubmit("time-expired");
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [attempt, submitted]);

  useEffect(() => {
    if (!attempt || !expiresAt) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !submitted) {
        void handleAutoSubmit("visibility-hidden");
      }
    };

    const handleBlur = () => {
      if (!submitted) {
        void handleAutoSubmit("tab-change");
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submitted) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [attempt, expiresAt, submitted]);

  async function handleStart() {
    if (starting) {
      return;
    }

    setStarting(true);

    try {
      const response = await fetch(`/api/free-tests/${freeTest.id}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.locked) {
          toast("You have used all 10 free attempts.", "error");
          return;
        }

        if (payload?.active) {
          toast("Another exam is currently active.", "error");
          return;
        }

        toast(payload?.error ?? "Unable to start free test.", "error");
        return;
      }

      const nextAttempt = payload.data?.attempt;
      const nextQuestions = payload.data?.questions ?? [];

      if (!nextAttempt || !nextQuestions.length) {
        toast("No exam data was returned.", "error");
        return;
      }

      const nextAnswers: Record<string, number | null> = {};
      const nextLocked = new Set<string>();

      for (const answer of nextAttempt.answers) {
        nextAnswers[answer.questionId] = answer.selectedOptionIndex;

        if (answer.selectedOptionIndex !== null) {
          nextLocked.add(answer.questionId);
        }
      }

      setAttemptId(nextAttempt.id);
      setExpiresAt(nextAttempt.expiresAt);
      setQuestionList(nextQuestions);
      setAnswers(nextAnswers);
      setLocked(nextLocked);
      setTimeLeftSeconds(
        Math.max(
          0,
          Math.ceil((new Date(nextAttempt.expiresAt).getTime() - Date.now()) / 1000),
        ),
      );
      setStartDialogOpen(false);
      setReadRules(false);
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Unable to start this free test.",
        "error",
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleOptionClick(questionId: string, selectedIndex: number) {
    if (!attemptId || locked.has(questionId)) {
      return;
    }

    const previousValue = answers[questionId] ?? null;
    const nextAnswers = { ...answers, [questionId]: selectedIndex };
    const nextLocked = new Set(locked);
    nextLocked.add(questionId);

    setAnswers(nextAnswers);
    setLocked(nextLocked);

    try {
      const response = await fetch(`/api/free-tests/${freeTest.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          questionId,
          selectedOptionIndex: selectedIndex,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setAnswers({ ...answers, [questionId]: previousValue });
        nextLocked.delete(questionId);
        setLocked(nextLocked);
        throw new Error(payload?.error ?? "Answer could not be locked.");
      }
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Unable to save your answer.",
        "error",
      );
    }
  }

  async function handleAutoSubmit(reason: "tab-change" | "visibility-hidden") {
    if (submitted || submitting || isSubmittingRef.current) {
      return;
    }

    await handleSubmit(reason);
  }

  async function handleSubmit(
    reason: "manual" | "tab-change" | "visibility-hidden" | "time-expired",
  ) {
    if (!attemptId || submitted || submitting || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setAutoSubmitReason(reason);

    try {
      const response = await fetch(`/api/free-tests/${freeTest.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attemptId, reason }),
      });

      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        throw new Error(payload?.error ?? "Unable to submit free test.");
      }

      setSubmitted(true);
      setSubmitDialogOpen(false);

      if (reason !== "manual") {
        setSubmitBannerOpen(true);
      }

      window.setTimeout(() => {
        router.replace(
          `/dashboard/free-tests/${freeTest.id}/result?attemptId=${encodeURIComponent(attemptId)}`,
        );
      }, reason === "manual" ? 150 : 2000);
    } catch (error) {
      console.error(error);
      isSubmittingRef.current = false;
      setSubmitting(false);
      toast(
        error instanceof Error ? error.message : "Unable to submit your exam.",
        "error",
      );
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const remaining = (seconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${remaining}`;
  };

  const displayQuestions = questionList;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {startDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/75 p-4">
          <Card className="w-full max-w-2xl border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Free model test
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-primary">
                  {freeTest.title}
                </h2>
              </div>
              <Link
                href="/dashboard/free-tests"
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </div>

            <div className="mt-6 space-y-4 rounded-lg border border-border bg-muted/5 p-4 text-sm text-foreground">
              <p>
                <span className="font-medium text-primary">Duration:</span>{" "}
                {freeTest.durationMinutes} minutes.
              </p>
              <p>
                <span className="font-medium text-primary">Total questions:</span>{" "}
                {freeTest.totalQuestions}.
              </p>
              <p>
                <span className="font-medium text-primary">Pass mark:</span>{" "}
                {freeTest.passMarkPercent}%.
              </p>
              <p>
                <span className="font-medium text-primary">Questions:</span>{" "}
                Shuffled for each attempt.
              </p>
              <p>
                <span className="font-medium text-primary">Format:</span>{" "}
                All questions are visible on a single page.
              </p>
              <p>
                <span className="font-medium text-primary">Locking:</span>{" "}
                Answers are locked once selected.
              </p>
              <p>
                <span className="font-medium text-primary">Security:</span>{" "}
                Switching tabs auto-submits the exam.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={readRules}
                onChange={(event) => setReadRules(event.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer accent-primary"
              />
              <span>
                I have read and understood the rules for this free test.
              </span>
            </label>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/free-tests")}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm text-foreground hover:bg-muted/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={!readRules || starting}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Begin Free Test"
                )}
              </button>
            </div>
          </Card>
        </div>
      ) : null}

      {!submitted ? (
        <>
          <div className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-heading text-lg font-semibold text-primary">
                  {freeTest.title}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div
                  className={
                    timeLeftSeconds <= 300
                      ? "font-mono text-2xl font-semibold text-red-600"
                      : "font-mono text-2xl font-semibold text-primary"
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    {formatTime(timeLeftSeconds)}
                  </span>
                </div>

                <div className="text-sm text-muted">
                  Answered {answeredCount} / {questionList.length}
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitDialogOpen(true)}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <p>
                Do not switch tabs. Doing so submits your free test immediately.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {displayQuestions.map((question, index) => {
              const selectedValue = answers[question.id] ?? null;
              const isLocked = locked.has(question.id);

              return (
                <Card
                  key={question.id}
                  className="border-border bg-card p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-heading text-lg font-semibold text-primary">
                      Q{index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-border bg-muted/5 px-2 py-1 text-xs text-muted">
                        {question.marks} mark{question.marks === 1 ? "" : "s"}
                      </span>
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-accent" />
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-4 text-[15px] leading-7 text-foreground">
                    {question.questionText}
                  </p>

                  {question.options ? (
                    <div className="mt-6 space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const selected = selectedValue === optionIndex;

                        return (
                          <button
                            key={`${question.id}-${optionIndex}`}
                            type="button"
                            disabled={isLocked}
                            onClick={() =>
                              void handleOptionClick(question.id, optionIndex)
                            }
                            className={
                              selected
                                ? "flex w-full cursor-pointer items-start gap-3 rounded-md border border-primary bg-primary/5 p-4 text-left text-sm text-primary transition-colors"
                                : "flex w-full cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-4 text-left text-sm text-foreground transition-colors hover:bg-muted/5"
                            }
                          >
                            <span
                              className={
                                selected
                                  ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-cream"
                                  : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-muted"
                              }
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-muted">
                      Written questions are not graded in free tests. Skip to continue.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      ) : null}

      {submitDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/75 p-4">
          <Card className="w-full max-w-md border-border bg-card p-6">
            <h3 className="font-heading text-2xl font-semibold text-primary">
              Submit your free test?
            </h3>
            <p className="mt-3 text-sm text-muted">
              You have answered {answeredCount} question{answeredCount === 1 ? "" : "s"}.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubmitDialogOpen(false)}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm text-foreground hover:bg-muted/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit("manual")}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
              >
                Submit now
              </button>
            </div>
          </Card>
        </div>
      ) : null}

      {submitBannerOpen && autoSubmitReason ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/80 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-900 shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <p className="text-sm font-medium">
              Your free test was submitted because you {autoSubmitReason === "tab-change" ? "switched tabs" : autoSubmitReason === "visibility-hidden" ? "left the page" : autoSubmitReason === "time-expired" ? "ran out of time" : "submitted it"}.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
