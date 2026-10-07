"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type FreeTestResult = {
  exam: {
    title: string;
    passMarkPercent: number;
    totalMarks: number;
  };
  attempt: {
    score: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    startedAt: string;
    submittedAt: string | null;
    autoSubmitReason: string | null;
  };
  passed: boolean;
  pendingWrittenGrading: boolean;
  questions: {
    position: number;
    questionText: string;
    options?: string[];
    correctOptionIndex?: number;
    selectedOptionIndex: number | null;
    marks: number;
    source: string;
    answerPdfUrl: string | null;
  }[];
};

export function FreeTestResultClient({
  freeTestId,
  attemptId,
}: {
  freeTestId: string;
  attemptId?: string;
}) {
  const [result, setResult] = useState<FreeTestResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const query = attemptId
      ? `?attemptId=${encodeURIComponent(attemptId)}`
      : "";

    fetch(`/api/free-tests/${freeTestId}/result${query}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "Could not load this result.");
        }
        setResult(payload.data.result as FreeTestResult);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Could not load this result.",
          );
        }
      });

    return () => controller.abort();
  }, [attemptId, freeTestId]);

  if (error) {
    return (
      <Card className="mx-auto max-w-5xl border-border bg-card p-6" role="alert">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          Result unavailable
        </h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="mx-auto max-w-5xl border-border bg-card p-6">
        <p className="text-sm text-muted">Loading your result…</p>
      </Card>
    );
  }

  const scorePercent =
    result.exam.totalMarks > 0
      ? Math.round((result.attempt.score / result.exam.totalMarks) * 100)
      : 0;
  const started = new Date(result.attempt.startedAt).getTime();
  const submitted = result.attempt.submittedAt
    ? new Date(result.attempt.submittedAt).getTime()
    : started;
  const minutes = Math.max(0, Math.round((submitted - started) / 60_000));

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              Free model test result
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
              {result.exam.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-primary/20 bg-primary/5 text-primary">
              {result.pendingWrittenGrading ? "Provisional score" : "Score"}:{" "}
              {scorePercent}%
            </Badge>
            <Badge
              className={
                result.pendingWrittenGrading
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : result.passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }
            >
              {result.pendingWrittenGrading
                ? "Written grading pending"
                : result.passed
                  ? "Passed"
                  : "Not passed"}
            </Badge>
            {result.attempt.autoSubmitReason ? (
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                Auto-submitted ({result.attempt.autoSubmitReason})
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Summary label="Correct" value={result.attempt.correctCount} />
          <Summary label="Wrong" value={result.attempt.wrongCount} />
          <Summary label="Skipped" value={result.attempt.skippedCount} />
          <Summary label="Score" value={`${result.attempt.score}/${result.exam.totalMarks}`} />
          <Summary label="Time" value={`${minutes} min`} />
        </div>
        {result.attempt.submittedAt ? (
          <p className="mt-4 text-xs text-muted">
            Submitted{" "}
            {new Date(result.attempt.submittedAt).toLocaleString("en")}
          </p>
        ) : null}
      </Card>

      <div className="space-y-4">
        {result.questions.map((question, index) => (
          <Card
            key={`${question.position}-${index}`}
            className="border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-primary">
                Q{index + 1}. {question.questionText}
              </h2>
              <Badge className="border-border bg-muted/5 text-muted">
                {question.marks} mark(s)
              </Badge>
            </div>
            {question.options?.length ? (
              <div className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const correct = question.correctOptionIndex === optionIndex;
                  const selected =
                    question.selectedOptionIndex === optionIndex;
                  return (
                    <div
                      key={`${question.position}-${optionIndex}`}
                      className={[
                        "rounded-md border p-3 text-sm",
                        correct
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "",
                        selected && !correct
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : "",
                      ].join(" ")}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + optionIndex)}.{" "}
                      </span>
                      {option}
                      {selected ? " — Your answer" : ""}
                      {correct ? " — Correct answer" : ""}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted">
                <p>Written response</p>
                {question.answerPdfUrl ? (
                  <a
                    href={question.answerPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-primary underline"
                  >
                    View submitted answer
                  </a>
                ) : (
                  <p className="mt-1">No uploaded response is available.</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold text-primary">
        {value}
      </p>
    </div>
  );
}
