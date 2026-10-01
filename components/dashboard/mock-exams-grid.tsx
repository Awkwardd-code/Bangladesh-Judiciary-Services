import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ActiveExam } from "@/lib/types/exam";

type MockExam = {
  id: string;
  title: string;
  description: string;
  questions: number;
  durationMinutes: number;
  examType: "preliminary" | "written";
  createdAt: string;
};

export function MockExamsGrid({
  exams,
  activeExam,
}: {
  exams: MockExam[];
  activeExam: ActiveExam;
}) {
  if (exams.length === 0) {
    return (
      <p className="mt-8 rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
        No published exams match your filters.
      </p>
    );
  }

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {exams.map((exam) => {
        const href =
          exam.examType === "written"
            ? `/dashboard/mock-exams/written/${exam.id}`
            : `/dashboard/mock-exams/${exam.id}`;
        const isActive =
          activeExam?.examId.toString() === exam.id &&
          activeExam.kind === exam.examType;
        const isBlocked = Boolean(activeExam && !isActive);

        return (
          <Card
            key={exam.id}
            className="flex flex-col border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge
                className={
                  exam.examType === "preliminary"
                    ? "border-primary text-primary"
                    : "border-accent text-accent"
                }
              >
                {exam.examType}
              </Badge>
              <span className="text-xs text-muted">
                {new Date(exam.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-lg font-semibold text-primary">
              {exam.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {exam.description || "Published BJS practice exam."}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {exam.questions} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {exam.durationMinutes} min
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <span className="text-xs text-muted">
                {isBlocked ? "Finish your active exam first" : "Published"}
              </span>
              <Link
                href={href}
                aria-disabled={isBlocked}
                tabIndex={isBlocked ? -1 : undefined}
                className={
                  isBlocked
                    ? "pointer-events-none inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md border border-border px-3 text-sm text-muted opacity-60"
                    : "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm text-cream hover:bg-primary-dark"
                }
              >
                {isActive ? "Resume" : "Start"}
                <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
