import type { Metadata } from "next";

import { CourseExamManager } from "@/components/admin/course-exam-manager";

export const metadata: Metadata = {
  title: "Course Exam Management — Admin — LegalPath Bangladesh",
  description: "Manage course exams and questions by course and week.",
};

export default function MockExamsPage() {
  return <CourseExamManager />;
}
