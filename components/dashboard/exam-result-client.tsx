"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type ExamResultPayload = {
  examTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTaken: string;
  autoSubmitReason?: string | null;
  questions: Array<{
    id: string;
    questionText: string;
    studentAnswer: number | null;
    correctAnswer: number | null;
    options: string[];
    explanation?: string;
    marks: number;
  }>;
};

export function ExamResultClient({ result }: { result: ExamResultPayload }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              Result
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
              {result.examTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-primary/20 bg-primary/5 text-primary">
              Score: {result.score}%
            </Badge>
            {result.autoSubmitReason ? (
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                Auto-submitted ({result.autoSubmitReason})
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Correct</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-primary">
              {result.correctCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Wrong</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-primary">
              {result.wrongCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Skipped</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-primary">
              {result.skippedCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Time</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-primary">
              {result.timeTaken}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-5">
        {result.questions.map((question, index) => {
          const isCorrect =
            question.studentAnswer !== null &&
            question.correctAnswer !== null &&
            question.studentAnswer === question.correctAnswer;
          const isWrong =
            question.studentAnswer !== null &&
            question.correctAnswer !== null &&
            question.studentAnswer !== question.correctAnswer;
          const isSkipped = question.studentAnswer === null;

          return (
            <Card
              key={question.id}
              className="border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-lg font-semibold text-primary">
                  Q{index + 1}. {question.questionText}
                </p>
                <Badge className="border-border bg-muted/5 text-muted">
                  {question.marks} mark(s)
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrectOption = question.correctAnswer === optionIndex;
                  const isSelected = question.studentAnswer === optionIndex;

                  return (
                    <div
                      key={`${question.id}-${optionIndex}`}
                      className={[
                        "rounded-md border p-3 text-sm",
                        isCorrectOption ? "border-amber-300 bg-amber-50 text-amber-900" : "",
                        isSelected && !isCorrectOption ? "border-rose-200 bg-rose-50 text-rose-900" : "",
                        isSelected && isCorrectOption ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "",
                      ].join(" ")}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + optionIndex)}. 
                      </span>
                      {option}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {isCorrect ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Correct
                  </Badge>
                ) : null}
                {isWrong ? (
                  <Badge className="border-rose-200 bg-rose-50 text-rose-700">
                    Wrong
                  </Badge>
                ) : null}
                {isSkipped ? (
                  <Badge className="border-muted bg-muted/5 text-muted">
                    Skipped
                  </Badge>
                ) : null}
              </div>

              {question.explanation ? (
                <div className="mt-4 rounded-md border border-border bg-muted/5 p-3 text-sm text-muted">
                  <p className="font-medium text-foreground">Explanation</p>
                  <p className="mt-2 leading-6">{question.explanation}</p>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
