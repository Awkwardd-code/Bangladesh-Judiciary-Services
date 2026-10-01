import type { Metadata } from "next";
import { Suspense } from "react";

import { SuccessStoriesAdminFilter } from "@/components/admin/success-stories-admin-filter";
import { SuccessStoriesAdminHeader } from "@/components/admin/success-stories-admin-header";
import { SuccessStoriesAdminTable } from "@/components/admin/success-stories-admin-table";
import { SuccessStoriesSummary } from "@/components/admin/success-stories-summary";

export const metadata: Metadata = {
  title: "Success Stories — Admin — BJS Prep",
};

export default function SuccessStoriesAdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SuccessStoriesAdminHeader />
      <Suspense fallback={<div className="h-24" />}>
        <SuccessStoriesSummary />
      </Suspense>
      <Suspense fallback={<div className="h-12" />}>
        <SuccessStoriesAdminFilter />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <SuccessStoriesAdminTable />
      </Suspense>
    </div>
  );
}
