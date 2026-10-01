import Link from "next/link";
import { Calendar, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const results = [
  { id: "r1", examTitle: "Preliminary Mock 01 — Criminal Law", category: "Preliminary", score: 78, totalQuestions: 100, correct: 78, attemptedAt: "27 Sep 2026", timeTaken: "2h 47m", status: "Passed" },
  { id: "r2", examTitle: "Preliminary Mock 02 — Civil Law", category: "Preliminary", score: 65, totalQuestions: 100, correct: 65, attemptedAt: "22 Sep 2026", timeTaken: "3h 00m", status: "Failed" },
  { id: "r3", examTitle: "Full Syllabus Mock 01", category: "Full Syllabus", score: 85, totalQuestions: 100, correct: 85, attemptedAt: "18 Sep 2026", timeTaken: "2h 32m", status: "Passed" },
  { id: "r4", examTitle: "Written Test — CPC Paper", category: "Written", score: 0, totalQuestions: 8, correct: 0, attemptedAt: "12 Sep 2026", timeTaken: "3h 00m", status: "Pending" },
  { id: "r5", examTitle: "Preliminary Mock 03 — Full Syllabus", category: "Full Syllabus", score: 72, totalQuestions: 100, correct: 72, attemptedAt: "05 Sep 2026", timeTaken: "2h 58m", status: "Passed" },
  { id: "r6", examTitle: "Written Test — CrPC Paper", category: "Written", score: 0, totalQuestions: 8, correct: 0, attemptedAt: "28 Aug 2026", timeTaken: "3h 00m", status: "Pending" },
];

export function ResultsList() {
  return (
    <section className="mt-8 space-y-4">
      {results.map((result) => (
        <Card key={result.id} className="border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <Badge className={categoryClass(result.category)}>{result.category}</Badge>
              <h2 className="mt-3 font-heading text-lg font-semibold text-primary">{result.examTitle}</h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span className="flex items-center gap-1"><Calendar size={14} />{result.attemptedAt}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{result.timeTaken}</span>
                <span className="flex items-center gap-1"><FileText size={14} />{result.correct}/{result.totalQuestions} correct</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-right"><p className="text-xs uppercase tracking-wide text-muted">Score</p><p className="mt-1 font-heading text-3xl font-bold text-primary">{result.status === "Pending" ? "—" : `${result.score}%`}</p></div>
              <Badge className={statusClass(result.status)}>{result.status}</Badge>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href={`/dashboard/results/${result.id}`} className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary hover:text-primary">View details</Link>
            {result.status !== "Pending" && <Link href={`/dashboard/results/${result.id}/review`} className="text-sm text-accent hover:underline">Review answers →</Link>}
          </div>
        </Card>
      ))}
    </section>
  );
}

function categoryClass(category: string) { return category === "Preliminary" ? "border-primary text-primary" : category === "Written" ? "border-accent text-accent" : "border-emerald-300 text-emerald-700"; }
function statusClass(status: string) { return status === "Passed" ? "border-emerald-300 text-emerald-700" : status === "Failed" ? "border-red-300 text-red-700" : "border-amber-300 text-amber-700"; }
