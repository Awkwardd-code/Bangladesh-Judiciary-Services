"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type MergedQuestion = {
  _id: string;
  kind: "preliminary" | "written";
  examId: string;
  questionText: string;
  subject: string;
  marks: number;
  order: number;
  createdAt?: Date | string;
};

export function QuestionBankClient({
  initialQuestions,
}: {
  initialQuestions: MergedQuestion[];
}) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "preliminary" | "written">(
    "all",
  );
  const [subjectFilter, setSubjectFilter] = useState("all");

  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          initialQuestions
            .map((question) => question.subject)
            .filter((subject) => Boolean(subject)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [initialQuestions],
  );

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialQuestions.filter((question) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        question.questionText.toLowerCase().includes(normalizedQuery) ||
        question.subject.toLowerCase().includes(normalizedQuery);
      const matchesKind =
        kindFilter === "all" || question.kind === kindFilter;
      const matchesSubject =
        subjectFilter === "all" || question.subject === subjectFilter;

      return matchesQuery && matchesKind && matchesSubject;
    });
  }, [initialQuestions, kindFilter, query, subjectFilter]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            Question bank
          </h1>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Back to admin
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by question or subject"
            className="h-11 rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none ring-0 focus:border-accent"
          />

          <select
            value={kindFilter}
            onChange={(event) =>
              setKindFilter(
                event.target.value as "all" | "preliminary" | "written",
              )
            }
            className="h-11 rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="all">All kinds</option>
            <option value="preliminary">Preliminary</option>
            <option value="written">Written</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="h-11 rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="all">All subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-lg font-semibold text-primary">No questions match.</p>
          <p className="mt-2 text-sm text-muted">
            Try a different search or add more questions to the exam bank.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary/5 text-primary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kind</th>
                  <th className="px-4 py-3 font-semibold">Question</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Marks</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.map((question) => (
                  <tr
                    key={`${question.kind}-${question._id}`}
                    className="border-t border-border align-top"
                  >
                    <td className="px-4 py-4">
                      <span
                        className={
                          question.kind === "preliminary"
                            ? "inline-flex rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                            : "inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                        }
                      >
                        {question.kind === "preliminary" ? "Preliminary" : "Written"}
                      </span>
                    </td>

                    <td className="max-w-xl px-4 py-4 text-foreground">
                      <p className="line-clamp-3 text-sm leading-6">
                        {question.questionText}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-border bg-muted/5 px-2.5 py-1 text-xs text-muted">
                        {question.subject || "General"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-primary">
                        {question.marks}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <details className="relative inline-block text-left">
                        <summary className="list-none cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-primary">
                          Actions
                        </summary>

                        <div className="absolute right-0 z-10 mt-2 w-36 rounded-md border border-border bg-card p-2 shadow-lg">
                          <Link
                            href={
                              question.kind === "preliminary"
                                ? `/admin/mock-exams/${question.examId}`
                                : `/admin/mock-exams/written/${question.examId}`
                            }
                            className="block cursor-pointer rounded-md px-2 py-2 text-sm text-foreground hover:bg-primary/5"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="mt-1 block w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                          >
                            Delete
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
