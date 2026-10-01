import type { Metadata } from "next";
import { Suspense } from "react";

import { MentorsTable } from "@/components/admin/mentors-table";

export const metadata: Metadata = {
  title: "Mentors — Admin — BJS Prep",
  description: "Manage faculty mentors displayed on the public site.",
};

export default function MentorsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-muted">Loading mentors...</p>
        </div>
      }
    >
      <MentorsTable />
    </Suspense>
  );
}