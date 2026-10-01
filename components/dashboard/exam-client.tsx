"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExamProps = {
  exam: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
    negativeMarking: number;
  };
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    marks: number;
    subject: string;
  }>;
  attempt: {
    id: string;
    startedAt: string;
    expiresAt: string;
    shuffledOrder: number[];
    answers: Array<{
      questionId: string;
      selectedOptionIndex: number | null;
      answeredAt: string | null;
    }>;
  } | null;
};

export function ExamClient({ exam, questions, attempt }: ExamProps) {
  const [attemptId, setAttemptId] = useState(attempt?.id ?? null);
  const [startedAt, setStartedAt] = useState(attempt?.startedAt ?? null);
  const [expiresAt, setExpiresAt] = useState(attempt?.expiresAt ?? null);
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
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expiresAt) {
      return exam.durationMinutes * 60;
    }

    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(!attempt);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [readRules, setReadRules] = useState(false);
  const [summaryReason, setSummaryReason] = useState<string | null>(null);

  const questionMap = useMemo(() => {
    return new Map(questions.map((question) => [question.id, question]));
  }, [questions]);

  const localOrder = useMemo(() => {
    if (attempt?.shuffledOrder) {
      return attempt.shuffledOrder;
    }

    return [...Array(questions.length).keys()].sort(() => Math.random() - 0.5);
  }, [attempt, questions.length]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null).length,
    [answers],
  );

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }

    const tick = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );

      setTimeLeft(remaining);

      if (remaining <= 0 && !submitted && !isSubmittingRef.current) {
        void handleSubmit("time-expired");
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [expiresAt, submitted]);

  useEffect(() => {
    if (!attempt || !expiresAt) {
      return;
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

  async function handleSubmit(reason: "manual" | "tab-change" | "visibility-hidden" | "time-expired") {
    if (!attemptId || submitted || submitting || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setSummaryReason(reason);

    try {
      const response = await fetch(`/api/exams/preliminary/${exam.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          reason,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to submit exam.");
      }

      setSubmitted(true);
      setWarningOpen(false);

      if (reason !== "manual") {
        setAutoSubmitting(true);
      }

      window.setTimeout(() => {
        window.location.href = `/dashboard/results/${attemptId}`;
      }, reason === "manual" ? 250 : 2000);
    } catch (error) {
      console.error(error);
      isSubmittingRef.current = false;
      setSubmitting(false);
      window.alert(
        error instanceof Error ? error.message : "Something went wrong while submitting.",
      );
    }
  }

  async function handleAutoSubmit(reason: "tab-change" | "visibility-hidden") {
    if (submitted || submitting || isSubmittingRef.current) {
      return;
    }

    await handleSubmit(reason);
  }

  async function handleOptionClick(questionId: string, selectedIndex: number) {
    const currentValue = answers[questionId];

    if (locked.has(questionId)) {
      return;
    }

    const next = { ...answers, [questionId]: selectedIndex };
    const nextLocked = new Set(locked);
    nextLocked.add(questionId);

    setAnswers(next);
    setLocked(nextLocked);

    if (!attemptId) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/preliminary/${exam.id}/answer`, {
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
        setAnswers({ ...answers, [questionId]: currentValue ?? null });
        nextLocked.delete(questionId);
        setLocked(nextLocked);
        throw new Error(payload?.error ?? "Answer could not be locked.");
      }
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Your selection could not be saved.",
      );
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  const beginExam = async () => {
    setStartDialogOpen(false);

    try {
      const response = await fetch(`/api/exams/preliminary/${exam.id}/start`, {
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to start exam.");
      }

      setAttemptId(payload.data.attempt._id);
      setStartedAt(payload.data.attempt.startedAt);
      setExpiresAt(payload.data.attempt.expiresAt);
      setTimeLeft(
        Math.max(
          0,
          Math.ceil(
            (new Date(payload.data.attempt.expiresAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );
      setAnswers({});
      setLocked(new Set());
      setReadRules(true);
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Your exam could not be started.",
      );
      setStartDialogOpen(true);
    }
  };

  if (startDialogOpen) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-2xl border-border bg-card p-6 shadow-sm">
          <h1 className="font-heading text-3xl font-semibold text-primary">
            {exam.title}
          </h1>
          <p className="mt-3 text-sm text-muted">{exam.description}</p>

          <div className="mt-6 space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Exam rules
            </div>
            <ul className="list-disc space-y-2 pl-5">
              <li>Duration: {exam.durationMinutes} minutes.</li>
              <li>Total questions: {exam.totalQuestions}.</li>
              <li>All questions are shown on one page.</li>
              <li>Answers are locked as soon as you select an option.</li>
              <li>Switching tabs or minimising the window submits automatically.</li>
              <li>When the timer reaches zero, the exam is submitted automatically.</li>
            </ul>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={readRules}
              onChange={(event) => setReadRules(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>I have read and understood the rules.</span>
          </label>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/mock-exams"
              className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm text-foreground"
            >
              Cancel
            </Link>
            <Button
              onClick={beginExam}
              disabled={!readRules}
              className="bg-primary text-cream hover:bg-primary-dark"
            >
              Begin Exam
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (autoSubmitting) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <p className="font-heading text-2xl font-semibold text-primary">
            Your exam was auto-submitted.
          </p>
          <p className="mt-3 text-sm text-muted">
            {summaryReason === "tab-change"
              ? "You switched tabs during the exam."
              : summaryReason === "visibility-hidden"
                ? "The page became hidden while the exam was active."
                : "The timer expired."}
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg border border-border bg-card p-8 text-center">
          <p className="font-heading text-2xl font-semibold text-primary">
            Exam submitted.
          </p>
          <p className="mt-3 text-sm text-muted">
            You answered {answeredCount} of {questions.length} questions.
          </p>
          <Link
            href={`/dashboard/results/${attemptId ?? ""}`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm text-cream hover:bg-primary-dark"
          >
            View results
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="sticky top-0 z-20 border-b border-border bg-card/90 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-xl font-semibold text-primary">
              {exam.title}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "font-mono text-2xl font-semibold",
                timeLeft < 300 ? "text-red-600" : "text-primary",
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </span>
            </div>

            <Button
              onClick={() => setWarningOpen(true)}
              className="bg-primary text-cream hover:bg-primary-dark"
            >
              Submit exam
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>
            Do not switch tabs or minimise the window. Doing so will submit your exam automatically.
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {localOrder.map((orderIndex, displayIndex) => {
          const question = questionMap.get(questions[orderIndex]?.id ?? "");

          if (!question) {
            return null;
          }

          const isLocked = locked.has(question.id);
          const selectedValue = answers[question.id] ?? null;

          return (
            <Card key={question.id} className="border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-lg font-semibold text-primary">
                  Q{displayIndex + 1}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="border-border bg-muted/5 text-muted">
                    {question.marks} mark(s)
                  </Badge>
                  {isLocked ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    </Badge>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 text-base leading-7 text-foreground">
                {question.questionText}
              </p>

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedValue === optionIndex;

                  return (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      disabled={isLocked}
                      onClick={() => void handleOptionClick(question.id, optionIndex)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md border p-4 text-left text-sm transition-colors",
                        answerButtonClass(isSelected, isLocked),
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          isSelected
                            ? "border-primary bg-primary text-cream"
                            : "border-border text-muted",
                        )}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {isLocked ? (
                <p className="mt-4 text-xs text-muted">
                  Answer locked. You cannot change this.
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>

      {warningOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-primary-dark/60 p-4">
          <Card className="w-full max-w-md border-border bg-card p-6">
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Submit your exam?
            </h2>
            <p className="mt-3 text-sm text-muted">
              You have answered {answeredCount} of {questions.length} questions. Once submitted, your answers are final.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setWarningOpen(false)}
                className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit("manual")}
                className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
              >
                Confirm
              </button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function answerButtonClass(isSelected: boolean, isLocked: boolean) {
  if (isSelected) {
    return "border-primary bg-primary/5 text-primary font-medium";
  }

  if (isLocked) {
    return "border-border bg-muted/5 text-muted cursor-not-allowed opacity-70";
  }

  return "border-border bg-card text-foreground hover:bg-primary/[0.03] cursor-pointer";
}
