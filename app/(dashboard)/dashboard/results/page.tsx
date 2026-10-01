import type { Metadata } from "next";

import { ResultsHeader } from "@/components/dashboard/results-header";
import { ResultsList } from "@/components/dashboard/results-list";
import { ResultsStats } from "@/components/dashboard/results-stats";

export const metadata: Metadata = {
  title: "Results — BJS Prep",
  description: "Your mock exam history and performance.",
};

export default function ResultsPage() {
  // NOTE: auth guard will be added via middleware in a later pass.
  return (
    <div className="mx-auto max-w-6xl">
      <ResultsHeader />
      <ResultsStats />
      <ResultsList />
    </div>
  );
}
