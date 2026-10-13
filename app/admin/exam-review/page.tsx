import type { Metadata } from "next";

import { WrittenSubmissionsList } from "@/components/admin/written-submissions-list";

export const metadata: Metadata = {
  title: "Exam Review — Admin — LegalPath Bangladesh",
};

export const dynamic = "force-dynamic";

export default function AdminExamReviewPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Exam Review
        </h1>
        <p className="mt-2 text-base text-muted">
          Grade written submissions from across all courses.
        </p>
      </header>
      <WrittenSubmissionsList />
    </div>
  );
}
