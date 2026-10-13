"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type EvaluationQuestion = {
  id: string;
  order: number;
  questionText: string;
  subject: string;
  maxMarks: number;
  pdfUrl: string | null;
  awardedMarks: number;
  comment: string;
};

type EvaluationData = {
  attempt: {
    id: string;
    status: string;
    score: number;
    maxScore: number;
    feedback: string;
  };
  exam: { id: string; title: string; totalMarks: number };
  user: { id: string; name: string; email: string } | null;
  questions: EvaluationQuestion[];
};

type Grade = {
  questionId: string;
  awardedMarks: number;
  comment: string;
};

export function UnifiedWrittenEvaluationClient({
  attemptId,
}: {
  attemptId: string;
}) {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [feedback, setFeedback] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/exam-attempts/${attemptId}`);
      const result = (await response.json()) as {
        error?: string;
        data?: EvaluationData;
      };
      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Unable to load exam attempt.");
      }
      setData(result.data);
      setFeedback(result.data.attempt.feedback);
      setGrades(
        result.data.questions.map((question) => ({
          questionId: question.id,
          awardedMarks: question.awardedMarks,
          comment: question.comment,
        })),
      );
      setDirty(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load exam attempt.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalScore = useMemo(
    () => grades.reduce((total, grade) => total + grade.awardedMarks, 0),
    [grades],
  );

  function updateGrade(questionId: string, changes: Partial<Grade>) {
    setGrades((current) =>
      current.map((grade) =>
        grade.questionId === questionId ? { ...grade, ...changes } : grade,
      ),
    );
    setDirty(true);
    setSaved(false);
  }

  async function saveGrades() {
    if (!data || !dirty || saving) {
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/exam-attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perQuestionScores: grades, feedback }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save grades.");
      }
      setSaved(true);
      await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save grades.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted">Loading written attempt…</p>;
  }
  if (!data) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-red-700">
          {error || "Written attempt not found."}
        </p>
        <Link href="/admin/exam-review" className="mt-4 inline-flex text-sm text-accent">
          Back to exam review
        </Link>
      </div>
    );
  }

  const student = data.user?.name ?? "Unknown student";

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/exam-review" className="text-sm text-accent hover:underline">
            Exam review
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            {data.exam.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {student} · {data.user?.email ?? "No email"} ·{" "}
            <Badge>{data.attempt.status}</Badge>
          </p>
        </div>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void saveGrades()}
          className="h-10 cursor-pointer rounded-md bg-primary px-5 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save grades"}
        </button>
      </header>

      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {saved ? <p role="status" className="text-sm text-emerald-700">Grades saved.</p> : null}
      <Card className="p-4">
        <p className="text-sm font-medium text-primary">
          Current total: {totalScore} /{" "}
          {grades.reduce((total, grade) => {
            const question = data.questions.find((item) => item.id === grade.questionId);
            return total + (question?.maxMarks ?? 0);
          }, 0)}{" "}
          marks
        </p>
      </Card>

      {data.questions.map((question) => {
        const grade = grades.find((item) => item.questionId === question.id);
        if (!grade) {
          return null;
        }
        return (
          <Card key={question.id} className="grid gap-5 p-5 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="font-heading font-semibold text-primary">
                Q{question.order}. {question.questionText}
              </h2>
              <p className="text-xs text-muted">{question.subject}</p>
              {question.pdfUrl ? (
                <>
                  <a
                    href={question.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm text-accent underline"
                  >
                    Open submitted answer
                  </a>
                  <iframe
                    title={`Answer to question ${question.order}`}
                    src={question.pdfUrl}
                    className="h-[60vh] w-full rounded-md border border-border"
                  />
                </>
              ) : (
                <p className="text-sm text-muted">No PDF answer was uploaded.</p>
              )}
            </section>
            <section className="space-y-3">
              <label className="block space-y-2 text-sm text-primary">
                Awarded marks (maximum {question.maxMarks})
                <input
                  type="number"
                  min={0}
                  max={question.maxMarks}
                  step="0.5"
                  value={grade.awardedMarks}
                  onChange={(event) =>
                    updateGrade(question.id, {
                      awardedMarks: Number(event.target.value),
                    })
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3"
                />
              </label>
              <label className="block space-y-2 text-sm text-primary">
                Comment
                <Textarea
                  value={grade.comment}
                  maxLength={1000}
                  onChange={(event) =>
                    updateGrade(question.id, { comment: event.target.value })
                  }
                />
              </label>
            </section>
          </Card>
        );
      })}

      <label className="block space-y-2 text-sm text-primary">
        Overall feedback
        <Textarea
          value={feedback}
          maxLength={3000}
          onChange={(event) => {
            setFeedback(event.target.value);
            setDirty(true);
            setSaved(false);
          }}
        />
      </label>
    </main>
  );
}
