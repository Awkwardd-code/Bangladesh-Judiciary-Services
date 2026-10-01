"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ImportExcelDialog } from "@/components/admin/import-excel-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Question = {
  _id: string;
  order: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  subject?: string;
  explanation?: string;
};
type Exam = {
  _id: string;
  title: string;
  status: string;
  totalQuestions: number;
  totalMarks: number;
};

export function ExamDetailClient({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [question, setQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    marks: "1",
    subject: "",
    explanation: "",
  });

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/preliminary-exams/${examId}`);
    const result = (await response.json()) as {
      data?: { exam?: Exam; questions?: Question[] };
    };
    setExam(result.data?.exam ?? null);
    setQuestions(result.data?.questions ?? []);
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addQuestion() {
    await fetch(`/api/admin/preliminary-exams/${examId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...question,
        marks: Number(question.marks),
        order: questions.length + 1,
      }),
    });
    setQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      marks: "1",
      subject: "",
      explanation: "",
    });
    setFormOpen(false);
    await load();
  }
  async function removeQuestion(id: string) {
    if (window.confirm("Delete this question?")) {
      await fetch(`/api/admin/preliminary-exams/${examId}/questions/${id}`, {
        method: "DELETE",
      });
      await load();
    }
  }

  if (!exam) return <p className="text-sm text-muted">Loading exam...</p>;
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/mock-exams" className="text-sm text-accent">
        ← Mock exams
      </Link>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            {exam.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {exam.totalQuestions} questions · {exam.totalMarks} marks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-cream"
          >
            <Plus size={16} />
            Add question
          </button>
          <ImportExcelDialog
            examId={examId}
            kind="mcq"
            onImported={() => void load()}
          />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {questions.map((item) => (
          <article
            key={item._id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-foreground">
                {item.order}. {item.questionText}
              </p>
              <button
                type="button"
                aria-label="Delete question"
                onClick={() => removeQuestion(item._id)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {item.options.map((option, index) => (
                <li
                  key={option}
                  className={
                    index === item.correctOptionIndex
                      ? "border-l-2 border-accent bg-accent/10 p-2 text-sm"
                      : "p-2 text-sm text-muted"
                  }
                >
                  {String.fromCharCode(65 + index)}. {option}
                </li>
              ))}
            </ol>
            {item.explanation ? (
              <p className="mt-3 text-sm text-muted">{item.explanation}</p>
            ) : null}
          </article>
        ))}
        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
            No questions yet.
          </div>
        ) : null}
      </div>
      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary">
              Add question
            </h2>
            <div className="mt-5 space-y-3">
              <Textarea
                rows={4}
                placeholder="Question text"
                value={question.questionText}
                onChange={(event) =>
                  setQuestion({ ...question, questionText: event.target.value })
                }
              />
              {question.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(event) => {
                    const options = [...question.options];
                    options[index] = event.target.value;
                    setQuestion({ ...question, options });
                  }}
                />
              ))}
              <label className="text-sm text-muted">
                Correct option
                <Select
                  value={String(question.correctOptionIndex)}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      correctOptionIndex: Number(event.target.value),
                    })
                  }
                >
                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>
                </Select>
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={question.marks}
                onChange={(event) =>
                  setQuestion({ ...question, marks: event.target.value })
                }
              />
              <Input
                placeholder="Subject"
                value={question.subject}
                onChange={(event) =>
                  setQuestion({ ...question, subject: event.target.value })
                }
              />
              <Textarea
                rows={3}
                placeholder="Explanation"
                value={question.explanation}
                onChange={(event) =>
                  setQuestion({ ...question, explanation: event.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="cursor-pointer px-4 text-sm text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm text-cream"
              >
                Save question
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
