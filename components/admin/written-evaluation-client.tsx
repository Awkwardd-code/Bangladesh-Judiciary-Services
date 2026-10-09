"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminWrittenEvaluationSkeleton } from "@/components/skeletons/admin-written-evaluation-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type EvaluationQuestion = {
  _id: string;
  order: number;
  questionText: string;
  maxMarks: number;
  subject?: string;
};

type QuestionGrade = {
  questionId: string;
  awardedMarks: number;
  comment: string;
};

type SubmissionRecord = {
  _id: string;
  answersPdfUrl: string;
  status: "submitted" | "under-review" | "graded";
  totalScore: number;
  maxScore: number;
  feedback?: string;
  perQuestionScores: {
    questionId: string;
    awardedMarks: number;
    comment?: string;
  }[];
};

type EvaluationData = {
  submission: SubmissionRecord;
  user: { id: string; name: string; email: string } | null;
  exam: { id: string; title: string; totalMarks: number } | null;
  questions: EvaluationQuestion[];
};

export function WrittenEvaluationClient({
  submissionId,
}: {
  submissionId: string;
}) {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [grades, setGrades] = useState<QuestionGrade[]>([]);
  const [feedback, setFeedback] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [iframeFailed, setIframeFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/written-submissions/${submissionId}`
      );
      const result = (await response.json()) as {
        error?: string;
        data?: EvaluationData;
      };

      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Unable to load submission.");
      }

      const record = result.data;
      const scoresByQuestion = new Map(
        record.submission.perQuestionScores.map((score) => [
          score.questionId,
          score,
        ])
      );
      setData(record);
      setFeedback(record.submission.feedback ?? "");
      setGrades(
        record.questions.map((question) => {
          const score = scoresByQuestion.get(question._id);

          return {
            questionId: question._id,
            awardedMarks: score?.awardedMarks ?? 0,
            comment: score?.comment ?? "",
          };
        })
      );
      setDirty(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load submission."
      );
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalScore = useMemo(
    () => grades.reduce((sum, grade) => sum + grade.awardedMarks, 0),
    [grades]
  );
  const maxScore = useMemo(
    () =>
      data?.questions.reduce((sum, question) => sum + question.maxMarks, 0) ??
      0,
    [data]
  );

  function updateGrade(questionId: string, changes: Partial<QuestionGrade>) {
    setGrades((current) =>
      current.map((grade) =>
        grade.questionId === questionId ? { ...grade, ...changes } : grade
      )
    );
    setDirty(true);
    setSavedMessage("");
  }

  async function saveGrades() {
    if (!dirty || !data) {
      return;
    }

    setSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(
        `/api/admin/written-submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            perQuestionScores: grades,
            feedback,
          }),
        }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save grades.");
      }

      setDirty(false);
      setSavedMessage("Grades saved.");
      await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save grades."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminWrittenEvaluationSkeleton />;
  }

  if (!data) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-600">
          {error || "Submission not found."}
        </p>
        <Link
          href="/admin/written-submissions"
          className="mt-4 inline-flex cursor-pointer text-sm text-accent"
        >
          Back to submissions
        </Link>
      </div>
    );
  }

  const studentName = data.user?.name ?? "Unknown student";

  return (
    <div className="-m-4 min-h-full bg-background sm:-m-6">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/written-submissions"
              className="cursor-pointer text-xs text-accent hover:underline"
            >
              Submissions / {studentName}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="truncate font-heading text-xl font-bold text-primary">
                {data.exam?.title ?? "Written exam"}
              </h1>
              <Badge className="text-muted">{data.submission.status}</Badge>
            </div>
          </div>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void saveGrades()}
            className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save grades"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-2 sm:px-6">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary">
                Answer sheet
              </h2>
              <p className="mt-1 text-sm text-muted">
                {studentName} · {data.user?.email ?? ""}
              </p>
            </div>
            <Link
              href={data.submission.answersPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer text-sm font-medium text-accent hover:underline"
            >
              Open in new tab
            </Link>
          </div>
          {iframeFailed ? (
            <div className="mt-4 flex h-[60vh] items-center justify-center rounded-md border border-border bg-background p-6 text-center">
              <p className="text-sm text-muted">
                The PDF preview is unavailable. Open the answer sheet in a new
                tab.
              </p>
            </div>
          ) : (
            <iframe
              title={`${studentName} answer sheet`}
              src={data.submission.answersPdfUrl}
              onError={() => setIframeFailed(true)}
              className="mt-4 h-[70vh] w-full rounded-md border border-border"
            />
          )}
          <Link
            href={data.submission.answersPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex cursor-pointer text-sm text-accent hover:underline"
          >
            Download answer sheet
          </Link>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Grade each question
          </h2>
          <div className="mt-5 space-y-4">
            {data.questions.map((question) => {
              const grade = grades.find(
                (item) => item.questionId === question._id
              );

              if (!grade) {
                return null;
              }

              return (
                <section
                  key={question._id}
                  className="rounded-md border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Question {question.order}
                        {question.subject ? ` · ${question.subject}` : ""}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground">
                        {question.questionText}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      Max {question.maxMarks}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]">
                    <label className="block text-xs font-medium text-primary">
                      Awarded
                      <input
                        type="number"
                        min={0}
                        max={question.maxMarks}
                        step={0.5}
                        value={grade.awardedMarks}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          const awardedMarks = Number.isFinite(value)
                            ? Math.min(question.maxMarks, Math.max(0, value))
                            : 0;
                          updateGrade(question._id, { awardedMarks });
                        }}
                        className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-primary outline-none focus:border-accent"
                      />
                    </label>
                    <label className="block text-xs font-medium text-primary">
                      Comment (optional)
                      <input
                        type="text"
                        maxLength={500}
                        value={grade.comment}
                        onChange={(event) =>
                          updateGrade(question._id, {
                            comment: event.target.value,
                          })
                        }
                        className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-primary outline-none focus:border-accent"
                      />
                    </label>
                  </div>
                </section>
              );
            })}
          </div>

          <label className="mt-5 block text-sm font-medium text-primary">
            Overall feedback
            <Textarea
              rows={5}
              maxLength={3000}
              value={feedback}
              onChange={(event) => {
                setFeedback(event.target.value);
                setDirty(true);
                setSavedMessage("");
              }}
              className="mt-2"
            />
          </label>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-primary">
              Total: {totalScore} / {maxScore}
            </span>
            {savedMessage ? (
              <span role="status" className="text-sm text-emerald-700">
                {savedMessage}
              </span>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </Card>
      </main>

      <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="text-xs text-muted">Auto-save on change</span>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void saveGrades()}
            className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save grades"}
          </button>
        </div>
      </div>
    </div>
  );
}
