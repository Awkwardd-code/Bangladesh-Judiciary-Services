import type { Metadata } from "next";

import { ResultsHeader } from "@/components/dashboard/results-header";
import { ResultsList } from "@/components/dashboard/results-list";
import { ResultsStats } from "@/components/dashboard/results-stats";
import { requireStudent } from "@/lib/auth-guard";
import { getStudentAttemptActivity } from "@/lib/stats";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Results — BJS Prep",
  description: "Your mock exam history and performance.",
};

export default async function ResultsPage() {
  const session = await requireStudent();
  if (!session) redirect("/login?next=%2Fdashboard%2Fresults");

  const { recentAttempts } = await getStudentAttemptActivity(
    new ObjectId(session.userId),
    null,
  );
  const scoredAttempts = recentAttempts.filter(
    (attempt) =>
      attempt.category !== "Written" || attempt.status === "graded",
  );
  const averageScore =
    scoredAttempts.length > 0
      ? Math.round(
          scoredAttempts.reduce(
            (total, attempt) => total + attempt.scorePercent,
            0,
          ) / scoredAttempts.length,
        )
      : 0;
  const bestScore = scoredAttempts.reduce(
    (best, attempt) => Math.max(best, attempt.scorePercent),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <ResultsHeader />
      <ResultsStats
        testsTaken={recentAttempts.length}
        averageScore={averageScore}
        bestScore={bestScore}
      />
      <ResultsList results={recentAttempts} />
    </div>
  );
}
