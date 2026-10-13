import { redirect } from "next/navigation";

export default function LegacyMockExamsPage() {
  redirect("/dashboard/exams");
}
