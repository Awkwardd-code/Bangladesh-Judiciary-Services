import { redirect } from "next/navigation";

export default async function LegacyFreeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/exam/free/${id}`);
}
