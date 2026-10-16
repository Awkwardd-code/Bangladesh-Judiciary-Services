import type { Metadata } from "next";

import { PreliminaryExamDetailClient } from "@/components/admin/preliminary-exam-detail-client";

export const metadata: Metadata = {
  title: "Preliminary Exam — Admin — LegalPath Bangladesh",
};

export default async function PreliminaryExamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <PreliminaryExamDetailClient
      examId={id}
      initialTab={query.tab === "settings" ? "settings" : "questions"}
    />
  );
}
