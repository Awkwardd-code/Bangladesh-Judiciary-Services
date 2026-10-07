"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, FileText, Lock, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WrittenExamProps = {
  exam: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalQuestions: number;
    totalMarks: number;
  };
  questions: Array<{
    id: string;
    questionText: string;
    maxMarks: number;
    subject: string;
  }>;
  submission: {
    id: string;
    startedAt: string;
    expiresAt: string;
    shuffledOrder: number[];
    perQuestionAnswers: Array<{
      questionId: string;
      pdfUrl?: string;
      pdfPublicId?: string;
      uploadedAt?: string;
    }>;
  } | null;
};

export function WrittenExamClient({ exam, questions, submission }: WrittenExamProps) {
  const [submissionId, setSubmissionId] = useState(submission?.id ?? null);
  const [expiresAt, setExpiresAt] = useState(submission?.expiresAt ?? null);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expiresAt) {
      return exam.durationMinutes * 60;
    }

    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });
  const [filesByQuestion, setFilesByQuestion] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    if (!submission) {
      return initial;
    }

    for (const answer of submission.perQuestionAnswers) {
      if (answer.pdfUrl) {
        initial[answer.questionId] = answer.pdfUrl;
      }
    }

    return initial;
  });
  const [locked, setLocked] = useState<Set<string>>(() => {
    if (!submission) {
      return new Set();
    }

    return new Set(
      submission.perQuestionAnswers
        .filter((answer) => answer.pdfUrl)
        .map((answer) => answer.questionId),
    );
  });
  const [startDialogOpen, setStartDialogOpen] = useState(!submission);
  const [readRules, setReadRules] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [summaryReason, setSummaryReason] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  const questionMap = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );

  const localOrder = useMemo(() => {
    if (submission?.shuffledOrder) {
      return submission.shuffledOrder;
    }

    return [...Array(questions.length).keys()].sort(() => Math.random() - 0.5);
  }, [questions.length, submission]);

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
    if (!submission || !expiresAt) {
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
  }, [expiresAt, submission, submitted]);

  async function handleSubmit(reason: "manual" | "tab-change" | "visibility-hidden" | "time-expired") {
    if (!submissionId || submitted || submitting || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setSummaryReason(reason);

    try {
      const response = await fetch(`/api/exams/written/${exam.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          reason,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to submit written exam.");
      }

      setSubmitted(true);
      setWarningOpen(false);

      if (reason !== "manual") {
        setAutoSubmitting(true);
      }

      window.setTimeout(() => {
        window.location.href = `/dashboard/mock-exams/written/${exam.id}/result?attemptId=${encodeURIComponent(submissionId)}`;
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

  async function beginExam() {
    setStartDialogOpen(false);

    try {
      const response = await fetch(`/api/exams/written/${exam.id}/start`, {
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to start written exam.");
      }

      setSubmissionId(payload.data.submission._id);
      setExpiresAt(payload.data.submission.expiresAt);
      setTimeLeft(
        Math.max(
          0,
          Math.ceil(
            (new Date(payload.data.submission.expiresAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );
      setReadRules(true);
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Your written exam could not be started.",
      );
      setStartDialogOpen(true);
    }
  }

  const uploadQuestionPdf = async (questionId: string, file: File) => {
    if (!submissionId) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      window.alert("Only PDF uploads are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.alert("PDF uploads must be 10 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("submissionId", submissionId);
    formData.append("questionId", questionId);
    formData.append("file", file);

    try {
      const response = await fetch(`/api/exams/written/${exam.id}/answer`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Upload failed.");
      }

      const nextLocked = new Set(locked);
      nextLocked.add(questionId);
      setLocked(nextLocked);
      setFilesByQuestion((current) => ({
        ...current,
        [questionId]: file.name,
      }));
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "The PDF could not be uploaded.",
      );
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainder = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
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
              Written exam instructions
            </div>
            <ul className="list-disc space-y-2 pl-5">
              <li>Duration: {exam.durationMinutes} minutes.</li>
              <li>Questions: {exam.totalQuestions}.</li>
              <li>Upload one PDF answer for each question.</li>
              <li>Each PDF is locked once uploaded and cannot be changed.</li>
              <li>Switching tabs or minimising the window submits automatically.</li>
              <li>When the timer ends, the exam is submitted automatically.</li>
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
            Your written exam was auto-submitted.
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
            Written exam submitted.
          </p>
          <p className="mt-3 text-sm text-muted">
            Your answers were successfully recorded.
          </p>
          <Link
            href={`/dashboard/results/${submissionId ?? ""}`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm text-cream hover:bg-primary-dark"
          >
            View result
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

          return (
            <Card key={question.id} className="border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-lg font-semibold text-primary">
                  Q{displayIndex + 1}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="border-border bg-muted/5 text-muted">
                    {question.maxMarks} mark(s)
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

              <div className="mt-5 rounded-md border border-dashed border-border bg-muted/5 p-4">
                {isLocked ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{filesByQuestion[question.id] ?? "PDF uploaded"}</span>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Locked
                    </Badge>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm text-foreground">
                      <Upload className="h-4 w-4 text-primary" />
                      Upload PDF answer
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadQuestionPdf(question.id, file);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
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
              Once you submit, your PDFs are final. Please ensure every question has a PDF answer uploaded.
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
