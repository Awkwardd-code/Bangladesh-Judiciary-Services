import { WrittenEvaluationClient } from "@/components/admin/written-evaluation-client";

export default async function WrittenSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WrittenEvaluationClient submissionId={id} />;
}
