"use client";

import Link from "next/link";
import { CheckCircle2, Clock, FileText, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const questions = [
  {
    id: 1,
    question: "Under the Code of Criminal Procedure, within what period must a police officer forward an arrested person to the nearest Magistrate?",
    options: ["12 hours", "24 hours", "36 hours", "48 hours"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which section of the Penal Code deals with the offence of criminal conspiracy?",
    options: ["Section 120A", "Section 302", "Section 420", "Section 499"],
    correct: 0,
  },
  {
    id: 3,
    question: "The doctrine of res gestae is codified in which section of the Evidence Act, 1872?",
    options: ["Section 6", "Section 8", "Section 32", "Section 60"],
    correct: 0,
  },
  {
    id: 4,
    question: "A confession made to a police officer is:",
    options: ["Admissible in all cases", "Admissible if voluntary", "Inadmissible", "Admissible with corroboration"],
    correct: 2,
  },
  {
    id: 5,
    question: "Under the CPC, a suit for specific performance of contract must be filed within:",
    options: ["1 year", "2 years", "3 years", "6 years"],
    correct: 2,
  },
];

export function TakeExamClient({ examId }: { examId: string }) {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(180 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer !== null).length,
    [answers],
  );

  useEffect(() => {
    if (!examStarted || submitted) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeRemainingSeconds((remaining) => {
        if (remaining <= 1) {
          setSubmitted(true);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examStarted, submitted]);

  function selectOption(optionIndex: number) {
    setAnswers((current) => ({
      ...current,
      [currentQuestionIndex]: optionIndex,
    }));
  }

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const remaining = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${remaining}`;
  }

  if (!examStarted) {
    return <PreExam onStart={() => setExamStarted(true)} examId={examId} />;
  }

  if (submitted) {
    return <Submitted answeredCount={answeredCount} />;
  }

  const question = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="mx-auto max-w-6xl">
      <div
        className="
          sticky top-0 z-10 flex flex-col gap-2 border-b border-border
          bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between
          lg:px-6 lg:py-4
        "
      >
        <h1 className="font-heading text-sm font-semibold text-primary sm:text-base">
          Preliminary Mock 01 — Criminal Law
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className={`flex items-center gap-2 font-mono text-sm font-medium ${timeRemainingSeconds < 300 ? "text-red-600" : "text-primary"}`}>
            <Clock size={16} className="text-accent" />
            {formatTime(timeRemainingSeconds)}
          </span>
          <SubmitDialog
            answeredCount={answeredCount}
            onSubmit={() => setSubmitted(true)}
          />
          <button
            type="button"
            onClick={() => setNavigatorOpen(true)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-foreground sm:w-auto lg:hidden"
          >
            <Menu size={16} />
            Show navigator
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="border-border bg-card p-5 sm:p-8">
          <p className="text-xs uppercase tracking-wide text-muted">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <h2
            className="mt-4 text-base font-medium leading-7 text-foreground sm:text-lg"
          >
            {question.question}
          </h2>
          <div className="mt-8 space-y-3">
            {question.options.map((option, index) => {
              const selected = selectedAnswer === index;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(index)}
                  className={`flex min-h-14 w-full items-start gap-3 rounded-md border p-4 text-left text-sm transition-colors ${selected ? "border-primary bg-primary/[0.05] font-medium text-primary" : "border-border bg-card text-foreground hover:bg-primary/[0.03]"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${selected ? "border-primary bg-primary text-cream" : "border-border"}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((current) => current - 1)}
              className="h-11 flex-1 rounded-md border border-border px-4 text-sm text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => setCurrentQuestionIndex((current) => current + 1)}
              className="h-11 flex-1 rounded-md border border-border px-4 text-sm text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              Next
            </button>
          </div>
        </Card>

        <Card className="sticky top-24 hidden h-fit border-border bg-card p-6 lg:block">
          <p className="text-xs uppercase tracking-wide text-muted">Question navigator</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((item, index) => {
              const answered = answers[index] !== undefined && answers[index] !== null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-9 w-9 rounded-md text-xs font-medium ${index === currentQuestionIndex ? "bg-primary text-cream" : answered ? "border border-accent bg-accent/[0.15] text-accent" : "border border-border bg-card text-foreground hover:bg-primary/[0.03]"}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="my-6 border-t border-border" />
          <div className="space-y-2 text-xs text-muted">
            <Legend color="bg-primary" label="Current" />
            <Legend color="border border-accent bg-accent/[0.15]" label="Answered" />
            <Legend color="border border-border" label="Not answered" />
          </div>
        </Card>
      </div>

      {navigatorOpen ? (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer justify-end bg-primary-dark/50 lg:hidden"
          onClick={() => setNavigatorOpen(false)}
        >
          <aside
            className="h-full w-80 max-w-[85vw] cursor-default overflow-y-auto bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted">
                Question navigator
              </p>
              <button
                type="button"
                onClick={() => setNavigatorOpen(false)}
                aria-label="Close navigator"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-primary/5"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const answered = answers[index] !== undefined && answers[index] !== null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setNavigatorOpen(false);
                    }}
                    className={`h-10 w-10 rounded-md text-xs font-medium ${index === currentQuestionIndex ? "bg-primary text-cream" : answered ? "border border-accent bg-accent/[0.15] text-accent" : "border border-border bg-card text-foreground hover:bg-primary/[0.03]"}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="my-6 border-t border-border" />
            <div className="space-y-2 text-xs text-muted">
              <Legend color="bg-primary" label="Current" />
              <Legend color="border border-accent bg-accent/[0.15]" label="Answered" />
              <Legend color="border border-border" label="Not answered" />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function PreExam({ onStart, examId }: { onStart: () => void; examId: string }) {
  void examId;
  return (
    <div className="mx-auto max-w-2xl py-8 sm:py-12">
      <Card className="border-border bg-card p-5 text-center sm:p-8">
        <FileText className="mx-auto text-accent" size={48} />
        <h1 className="mt-6 font-heading text-3xl font-bold text-primary">Preliminary Mock 01 — Criminal Law</h1>
        <p className="mt-4 text-sm text-muted">Before you begin, note the following:</p>
        <ul className="mt-6 space-y-3 text-left text-sm text-foreground">
          <li>Duration: 180 minutes</li>
          <li>Total questions: {questions.length}</li>
          <li>No pausing once started</li>
          <li>You can navigate between questions before submitting</li>
          <li>Objective questions are auto-graded on submission</li>
        </ul>
        <button type="button" onClick={onStart} className="mt-8 h-12 w-full rounded-md bg-primary text-cream hover:bg-primary-dark">Start Test</button>
        <Link href="/dashboard/mock-exams" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border border-border text-sm text-foreground">Cancel</Link>
      </Card>
    </div>
  );
}

function SubmitDialog({ answeredCount, onSubmit }: { answeredCount: number; onSubmit: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <button
          type="button"
          className="h-9 w-full rounded-md bg-primary px-4 text-sm text-cream sm:w-auto"
        >
          Submit
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your test?</AlertDialogTitle>
          <AlertDialogDescription>
            You have answered {answeredCount} of {questions.length} questions. You cannot change your answers after submission.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </div>
  );
}

function Submitted({ answeredCount }: { answeredCount: number }) {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card className="border-border bg-card p-5 text-center sm:p-8">
        <CheckCircle2 className="mx-auto text-accent" size={48} />
        <h1 className="mt-6 font-heading text-3xl font-bold text-primary">Test submitted.</h1>
        <p className="mt-4 text-sm text-muted">Your responses have been recorded. Results will be available on the Results page.</p>
        <div className="mt-8 space-y-3 rounded-md bg-primary/[0.03] p-6 text-left text-sm text-foreground">
          <SummaryRow label="Questions answered" value={String(answeredCount)} />
          <SummaryRow label="Questions skipped" value={String(questions.length - answeredCount)} />
          <SummaryRow label="Time taken" value="—" />
        </div>
        <Link href="/dashboard/results" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm text-cream">View results</Link>
        <Link href="/dashboard/mock-exams" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border border-border text-sm text-foreground">Back to mock exams</Link>
        <p className="sr-only">NOTE: all grading, timing, and persistence are client-side for MVP. Real implementation will submit to /api/exams/[id]/submit and be server-validated.</p>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span>{label}</span><strong>{value}</strong></div>;
}
