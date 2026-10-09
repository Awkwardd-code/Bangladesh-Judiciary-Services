import { redirect } from "next/navigation";

export default async function LegacyPreliminaryExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/exam/preliminary/${id}`);
}
