import type { Metadata } from "next";

import { WrittenExamDetailClient } from "@/components/admin/written-exam-detail-client";

export const metadata: Metadata = {
  title: "Written Exam — Admin — LegalPath Bangladesh",
};

export default async function WrittenExamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  return (
    <WrittenExamDetailClient
      examId={id}
      initialTab={query.tab === "settings" ? "settings" : "questions"}
    />
  );
}
