import { FileText } from "lucide-react";

import { ExamCard } from "@/components/shared/exam-card";
import type { UnifiedExamCard } from "@/lib/exams-query";

export function MockExamsGrid({
  exams,
  attemptMap,
  enrollmentMap,
}: {
  exams: UnifiedExamCard[];
  attemptMap: Record<string, { attempts: number; bestScore: number | null }>;
  enrollmentMap: Record<string, "approved" | "pending" | "rejected" | "none">;
}) {
  if (exams.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <div className="mb-3 flex justify-center text-primary">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-xl font-semibold text-primary">
          No model tests available.
        </h3>
        <p className="mt-2 text-sm text-muted">
          No published exams are available right now.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          variant="student"
          attempt={attemptMap[exam.id]}
          accessState={
            exam.isFree
              ? "approved"
              : exam.courseId
                ? (enrollmentMap[exam.courseId] ?? "none")
                : "none"
          }
        />
      ))}
    </section>
  );
}
