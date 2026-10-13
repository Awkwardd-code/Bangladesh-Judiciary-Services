import type { Metadata } from "next";

import { ProgramsGrid } from "@/components/sections/programs-grid";
import { requireAdmin } from "@/lib/auth-guard";
import { getCategorySummaries } from "@/lib/category-query";

export const metadata: Metadata = {
  title: "Programs | Admin",
};

export default async function AdminProgramsPage() {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const summaries = await getCategorySummaries();

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-primary">
            Programs overview
          </h1>
          <p className="mt-2 text-sm text-muted">
            Track course counts across all program categories.
          </p>
        </div>
        <ProgramsGrid summaries={summaries} />
      </div>
    </div>
  );
}
