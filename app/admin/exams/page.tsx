import type { Metadata } from "next";

import { CourseExamManager } from "@/components/admin/course-exam-manager";

export const metadata: Metadata = {
  title: "Exams — Admin — LegalPath Bangladesh",
};

export const dynamic = "force-dynamic";

export default function AdminExamsPage() {
  return <CourseExamManager />;
}
