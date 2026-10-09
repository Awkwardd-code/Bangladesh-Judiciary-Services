import type { Metadata } from "next";
import { Suspense } from "react";

import { MentorsTable } from "@/components/admin/mentors-table";
import { AdminMentorsSkeleton } from "@/components/skeletons/admin-mentors-skeleton";

export const metadata: Metadata = {
  title: "Mentors — Admin — BJS Prep",
  description: "Manage faculty mentors displayed on the public site.",
};

export default function MentorsPage() {
  return (
    <Suspense fallback={<AdminMentorsSkeleton />}>
      <MentorsTable />
    </Suspense>
  );
}
