import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

import type { PreliminaryQuestion, WrittenQuestion } from "@/lib/types/exam";

type QuestionListProps = {
  kind: "mcq" | "written";
  examId: string;
  questions: PreliminaryQuestion[] | WrittenQuestion[];
  onChanged: () => void;
  onEdit?: (question: PreliminaryQuestion | WrittenQuestion) => void;
  onDelete?: (question: PreliminaryQuestion | WrittenQuestion) => void;
  onMove?: (
    question: PreliminaryQuestion | WrittenQuestion,
    direction: -1 | 1
  ) => void;
};

export function QuestionList({
  kind,
  examId,
  questions,
  onChanged,
  onEdit,
  onDelete,
  onMove,
}: QuestionListProps) {
  void examId;
  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-base font-medium text-primary">No questions yet.</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onChanged()}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream"
          >
            Add question
          </button>
          <button
            type="button"
            onClick={() => onChanged()}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm text-foreground"
          >
            Import from Excel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        if (kind === "mcq") {
          const item = question as PreliminaryQuestion;

          return (
            <article
              key={String(item._id)}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-primary/[0.02]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary/5 px-2 text-xs font-semibold text-primary">
                    #{item.order}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    MCQ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMove?.(item, -1)}
                    disabled={index === 0}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove?.(item, 1)}
                    disabled={index === questions.length - 1}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(item)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5"
                    aria-label="Edit question"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(item)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50"
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {item.questionText}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.options.map((option, optionIndex) => (
                  <div
                    key={`${item._id}-${optionIndex}`}
                    className={
                      optionIndex === item.correctOptionIndex
                        ? "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
                        : "rounded-md border border-border bg-muted/5 p-3 text-sm text-foreground"
                    }
                  >
                    <span className="font-medium">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {item.subject ? (
                  <span className="rounded-full border border-border bg-primary/5 px-2 py-1 text-primary">
                    {item.subject}
                  </span>
                ) : null}
                <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-muted">
                  {item.marks} mark{item.marks === 1 ? "" : "s"}
                </span>
              </div>
            </article>
          );
        }

        const item = question as WrittenQuestion;

        return (
          <article
            key={String(item._id)}
            className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-primary/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary/5 px-2 text-xs font-semibold text-primary">
                  #{item.order}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Written
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onMove?.(item, -1)}
                  disabled={index === 0}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove?.(item, 1)}
                  disabled={index === questions.length - 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit?.(item)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted hover:bg-muted/5"
                  aria-label="Edit question"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(item)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50"
                  aria-label="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {item.questionText}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border bg-primary/5 px-2 py-1 text-primary">
                {item.maxMarks} marks
              </span>
              {item.subject ? (
                <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-muted">
                  {item.subject}
                </span>
              ) : null}
              {item.modelAnswerUrl ? (
                <a
                  href={item.modelAnswerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-accent/10 px-2 py-1 text-accent"
                >
                  View model answer
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
