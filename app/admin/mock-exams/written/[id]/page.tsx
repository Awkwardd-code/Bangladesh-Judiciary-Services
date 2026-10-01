import type { Metadata } from "next";

import { WrittenExamDetailClient } from "@/components/admin/written-exam-detail-client";

export const metadata: Metadata = {
  title: "Written Exam — Admin — BJS Prep",
};

export default async function WrittenExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WrittenExamDetailClient examId={id} />;
}
