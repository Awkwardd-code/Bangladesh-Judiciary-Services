import type { Metadata } from "next";

import { WrittenSubmissionsList } from "@/components/admin/written-submissions-list";

export const metadata: Metadata = {
  title: "Written Submissions — Admin — BJS Prep",
};

export default function WrittenSubmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Written Submissions
        </h1>
        <p className="mt-2 text-base text-muted">
          Review submitted answer sheets and evaluate written responses.
        </p>
      </header>
      <WrittenSubmissionsList />
    </div>
  );
}
