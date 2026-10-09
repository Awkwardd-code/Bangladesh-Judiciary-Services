import { redirect } from "next/navigation";

export default async function LegacyWrittenExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/exam/written/${id}`);
}
