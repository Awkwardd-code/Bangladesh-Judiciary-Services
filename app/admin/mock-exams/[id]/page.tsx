import type { Metadata } from "next";

import { ExamDetailClient } from "@/components/admin/exam-detail-client";

export const metadata: Metadata = {
  title: "Mock Exam — Admin — BJS Prep",
};

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamDetailClient examId={id} />;
}
