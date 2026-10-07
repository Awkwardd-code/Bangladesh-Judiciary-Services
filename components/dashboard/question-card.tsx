"use client";

import { CheckCircle2, FileText, Lock, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";

export type UploadedPdf = {
  url: string;
  name: string;
  uploadedAt: string;
};

export type RunnerQuestion = {
  id: string;
  questionText: string;
  options?: string[];
  marks: number;
  subject: string;
};

export function QuestionCard({
  index,
  question,
  isMCQ,
  isLocked,
  selectedOptionIndex,
  uploadedPdf,
  isUploading = false,
  onOptionClick,
  onPdfUpload,
}: {
  index: number;
  question: RunnerQuestion;
  isMCQ: boolean;
  isLocked: boolean;
  selectedOptionIndex: number | null;
  uploadedPdf: UploadedPdf | null;
  isUploading?: boolean;
  onOptionClick: (questionId: string, optionIndex: number) => void;
  onPdfUpload: (questionId: string, file: File) => Promise<void>;
}) {
  const inputId = `written-answer-${question.id}`;

  return (
    <Card className="relative rounded-lg border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Q{index + 1}
        </h2>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-border px-2 py-1 text-xs text-muted">
            {question.marks} mark{question.marks === 1 ? "" : "s"}
          </span>

          {isMCQ && isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          ) : null}

          {!isMCQ && uploadedPdf ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
              <Lock className="h-3.5 w-3.5" />
              PDF uploaded
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-7 text-foreground">
        {question.questionText}
      </p>

      {isMCQ ? (
        <div className="mt-5 space-y-2">
          {(question.options ?? []).map((option, optionIndex) => {
            const selected = selectedOptionIndex === optionIndex;

            return (
              <button
                key={`${question.id}-${optionIndex}`}
                type="button"
                disabled={isLocked}
                onClick={() => onOptionClick(question.id, optionIndex)}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-md border p-4 text-left text-sm transition-colors disabled:cursor-not-allowed ${
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted/5"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    selected
                      ? "bg-primary text-cream"
                      : "border border-border bg-card text-muted"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}

          {isLocked ? (
            <p className="pt-1 text-xs text-muted">
              Answer locked. You cannot change this.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6">
          {uploadedPdf ? (
            <div className="flex flex-col gap-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-emerald-950">
                    {uploadedPdf.name}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    Uploaded {new Date(uploadedPdf.uploadedAt).toLocaleString()}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Locked
                  </span>
                </div>
              </div>

              <a
                href={uploadedPdf.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-emerald-300 px-3 text-sm text-emerald-900 hover:bg-emerald-100"
              >
                View PDF
              </a>
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed border-border p-4 transition-colors hover:border-accent">
              <input
                id={inputId}
                type="file"
                accept=".pdf,application/pdf"
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (file) {
                    void onPdfUpload(question.id, file);
                  }

                  event.currentTarget.value = "";
                }}
              />

              <label
                htmlFor={inputId}
                className={`flex min-h-32 cursor-pointer flex-col items-center justify-center text-center ${
                  isUploading ? "cursor-wait opacity-60" : ""
                }`}
              >
                <Upload className="h-6 w-6 text-muted" />
                <span className="mt-3 text-sm font-medium text-foreground">
                  {isUploading
                    ? "Uploading answer..."
                    : "Upload your answer as PDF"}
                </span>
                <span className="mt-1 text-xs text-muted">Max 10 MB</span>
                <span className="mt-3 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-foreground">
                  Choose file
                </span>
              </label>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
