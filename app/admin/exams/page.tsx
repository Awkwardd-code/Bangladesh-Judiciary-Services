import type { Metadata } from "next";

import { ExamsList } from "@/components/admin/exams-list";

export const metadata: Metadata = {
  title: "Exams — Admin — LegalPath Bangladesh",
};

export const dynamic = "force-dynamic";

export default function AdminExamsPage() {
  return <ExamsList />;
}
