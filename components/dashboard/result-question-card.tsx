"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type ResultQuestion = {
  position: number;
  questionId: string;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  selectedOptionIndex?: number | null;
  isCorrect?: boolean;
  skipped?: boolean;
  marks: number;
  maxMarks?: number;
  subject: string;
  explanation?: string;
  pdfUrl?: string | null;
  awardedMarks?: number;
  comment?: string;
};

export function ResultQuestionCard({
  index,
  question,
  kind,
}: {
  index: number;
  question: ResultQuestion;
  kind: "preliminary" | "written" | "free";
}) {
  const isWritten = kind === "written" || !question.options?.length;
  const skipped =
    question.skipped ?? question.selectedOptionIndex === null;
  const correct =
    question.isCorrect ??
    (question.selectedOptionIndex !== null &&
      question.selectedOptionIndex === question.correctOptionIndex);
  const borderClass = isWritten
    ? question.awardedMarks === undefined
      ? "border-l-border"
      : question.awardedMarks > 0
        ? "border-l-emerald-500"
        : "border-l-red-500"
    : skipped
      ? "border-l-border"
      : correct
        ? "border-l-emerald-500"
        : "border-l-red-500";

  return (
    <Card className={`border-l-4 p-5 ${borderClass}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-primary">
          Q{index + 1}
        </h3>
        <div className="flex items-center gap-2">
          <Badge className="border-border bg-muted/5 text-muted">
            {isWritten
              ? `${question.maxMarks ?? question.marks} marks`
              : `${question.marks} marks`}
          </Badge>
          {isWritten ? (
            question.awardedMarks !== undefined ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Graded
              </Badge>
            ) : (
              <Badge className="border-border text-muted">Awaiting review</Badge>
            )
          ) : skipped ? (
            <Badge className="border-border text-muted">Skipped</Badge>
          ) : correct ? (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Correct
            </Badge>
          ) : (
            <Badge className="border-red-200 bg-red-50 text-red-700">
              Wrong
            </Badge>
          )}
        </div>
      </header>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {question.questionText}
      </p>
      <p className="mt-2 text-xs text-muted">{question.subject}</p>

      {question.options?.length ? (
        <div className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => {
            const isAnswer = optionIndex === question.correctOptionIndex;
            const isSelected = optionIndex === question.selectedOptionIndex;
            const wrongSelection = isSelected && !correct;
            return (
              <div
                key={`${question.questionId}-${optionIndex}`}
                className={`flex items-center justify-between gap-3 rounded-md border p-3 text-sm ${
                  isAnswer
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : wrongSelection
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-border bg-card text-foreground"
                }`}
              >
                <span>
                  <span className="font-medium">
                    {String.fromCharCode(65 + optionIndex)}.{" "}
                  </span>
                  {option}
                </span>
                {isAnswer ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs">
                    <CheckCircle2 size={15} />
                    Correct answer
                  </span>
                ) : wrongSelection ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs">
                    <XCircle size={15} />
                    Your answer
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {question.pdfUrl ? (
            <a
              href={question.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer text-sm text-primary underline"
            >
              View your answer
            </a>
          ) : (
            <p className="text-sm text-muted">No answer file was uploaded.</p>
          )}
          {question.awardedMarks !== undefined ? (
            <p className="text-sm font-medium text-primary">
              Score: {question.awardedMarks} / {question.maxMarks ?? question.marks}
            </p>
          ) : null}
          {question.comment ? (
            <div className="rounded-md bg-muted/5 p-3 text-sm text-muted">
              {question.comment}
            </div>
          ) : null}
        </div>
      )}

      {question.explanation ? (
        <div className="mt-4 rounded-md bg-muted/5 p-3 text-sm text-muted">
          <p className="font-medium text-foreground">Explanation</p>
          <p className="mt-1 leading-6">{question.explanation}</p>
        </div>
      ) : null}
    </Card>
  );
}
