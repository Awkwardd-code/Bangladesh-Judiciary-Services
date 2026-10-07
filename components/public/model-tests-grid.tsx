import { FileText } from "lucide-react";

import { ExamCard } from "@/components/shared/exam-card";
import type { UnifiedExamCard } from "@/lib/exams-query";

export function ModelTestsGrid({
  exams,
  attemptMap,
  isLoggedIn,
}: {
  exams: UnifiedExamCard[];
  attemptMap: Record<string, { attempts: number; bestScore: number | null }>;
  isLoggedIn: boolean;
}) {
  if (exams.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mb-3 flex justify-center text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-primary">
            No model tests available.
          </h3>
          <p className="mt-2 text-sm text-muted">
            Check back soon or browse courses.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            variant="public"
            attempt={isLoggedIn ? attemptMap[exam.id] : null}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </section>
  );
}
