"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LeaderboardKind } from "@/lib/leaderboard-query";

type QuestionReview = {
  position: number;
  questionId: string;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  selectedOptionIndex?: number | null;
  isCorrect?: boolean;
  skipped?: boolean;
  marks: number;
  subject?: string;
  explanation?: string;
  pdfUrl?: string | null;
  awardedMarks?: number;
  comment?: string;
};

type ReviewResponse = {
  questions: QuestionReview[];
};

export function LeaderboardAnswerReview({
  attemptId,
  kind,
}: {
  attemptId: string;
  kind: LeaderboardKind;
}) {
  const [questions, setQuestions] = useState<QuestionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetch(
      `/api/admin/leaderboard/${encodeURIComponent(
        attemptId
      )}?kind=${encodeURIComponent(kind)}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load answer details.");
        }

        const data = result.data as ReviewResponse;
        setQuestions(data.questions ?? []);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load answer details."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [attemptId, kind]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
        <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        Loading answer sheet…
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="py-6 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No questions available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.questionId}
          question={question}
          number={index + 1}
        />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  number,
}: {
  question: QuestionReview;
  number: number;
}) {
  const hasOptions = Boolean(question.options?.length);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading font-semibold text-primary">Q{number}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {hasOptions ? (
            question.skipped ? (
              <Badge className="border-border bg-primary/5 text-muted">
                Skipped
              </Badge>
            ) : question.isCorrect ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                Correct
              </Badge>
            ) : (
              <Badge className="border-red-200 bg-red-50 text-red-800">
                Wrong
              </Badge>
            )
          ) : null}
          <Badge>{question.marks} marks</Badge>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-primary">
        {question.questionText}
      </p>
      {question.subject ? (
        <p className="mt-2 text-xs text-muted">{question.subject}</p>
      ) : null}

      {hasOptions ? (
        <div className="mt-4 space-y-2">
          {question.options?.map((option, optionIndex) => {
            const isCorrectAnswer = optionIndex === question.correctOptionIndex;
            const isSelectedAnswer =
              optionIndex === question.selectedOptionIndex;
            const isIncorrectSelection = isSelectedAnswer && !isCorrectAnswer;

            return (
              <div
                key={`${question.questionId}:${optionIndex}`}
                className={`
                  flex items-start gap-2 rounded-md border px-3 py-2 text-sm
                  ${
                    isCorrectAnswer
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : isIncorrectSelection
                        ? "border-red-200 bg-red-50 text-red-900"
                        : "border-border bg-background text-primary"
                  }
                `}
              >
                {isCorrectAnswer ? (
                  <CheckCircle2
                    aria-label="Correct answer"
                    className="mt-0.5 shrink-0 text-emerald-600"
                    size={16}
                  />
                ) : isIncorrectSelection ? (
                  <XCircle
                    aria-label="Student's incorrect answer"
                    className="mt-0.5 shrink-0 text-red-600"
                    size={16}
                  />
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <span>
                  {option}
                  {isSelectedAnswer ? (
                    <span className="ml-2 text-xs font-medium">
                      Student answer
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {!hasOptions && question.pdfUrl ? (
        <a
          href={question.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary underline decoration-accent underline-offset-4"
        >
          <FileText aria-hidden="true" size={16} />
          View answer PDF
        </a>
      ) : null}

      {question.awardedMarks !== undefined ? (
        <p className="mt-4 text-sm font-medium text-primary">
          Marks: {question.awardedMarks} / {question.marks}
        </p>
      ) : null}
      {question.comment ? (
        <p className="mt-3 rounded-md bg-primary/5 p-3 text-sm text-primary">
          <span className="font-semibold">Mentor&apos;s comment: </span>
          {question.comment}
        </p>
      ) : null}
      {question.explanation ? (
        <div className="mt-4 rounded-md bg-primary/5 p-3 text-sm leading-relaxed text-muted">
          {question.explanation}
        </div>
      ) : null}
    </Card>
  );
}
