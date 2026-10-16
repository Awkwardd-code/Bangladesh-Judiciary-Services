import type { Metadata } from "next";

import { PreliminaryExamDetailClient } from "@/components/admin/preliminary-exam-detail-client";

export const metadata: Metadata = {
  title: "Preliminary Exam — Admin — LegalPath Bangladesh",
};

export default async function PreliminaryExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreliminaryExamDetailClient examId={id} />;
}
