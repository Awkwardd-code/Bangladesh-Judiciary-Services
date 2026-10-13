import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";

import { UnifiedWrittenEvaluationClient } from "@/components/admin/unified-written-evaluation-client";
import { requireAdmin } from "@/lib/auth-guard";
import { examAttemptsCol, examsCol } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function AdminExamReviewAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await requireAdmin();
  if (!session) {
    redirect("/login");
  }

  const { attemptId } = await params;
  if (!ObjectId.isValid(attemptId)) {
    notFound();
  }

  const attempt = await (await examAttemptsCol()).findOne({
    _id: new ObjectId(attemptId),
  });
  if (!attempt) {
    redirect(`/admin/written-submissions/${attemptId}`);
  }

  const exam = await (await examsCol()).findOne({ _id: attempt.examId });
  if (!exam || exam.kind !== "written") {
    notFound();
  }

  return <UnifiedWrittenEvaluationClient attemptId={attemptId} />;
}
