import { redirect } from "next/navigation";

export default async function EditExamCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/courses/${id}`);
}
