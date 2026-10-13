import type { Metadata } from "next";

import { CourseEditor } from "@/components/admin/course-editor";
import { requireAdmin } from "@/lib/auth-guard";
import { examsCol, mentorsCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "New Exam Course — Admin — LegalPath Bangladesh",
};

export default async function NewExamCoursePage() {
  const session = await requireAdmin();
  if (!session) {
    return null;
  }

  const [mentors, exams] = await Promise.all([
    (await mentorsCol())
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .toArray(),
    (await examsCol())
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  return (
    <CourseEditor
      course={null}
      mentors={mentors.map((mentor) => ({
        id: mentor._id.toString(),
        name: mentor.name,
        title: mentor.title,
        photoUrl: mentor.photoUrl ?? null,
      }))}
      exams={exams.map((exam) => ({
        id: exam._id.toString(),
        title: exam.title,
        courseId: exam.courseId.toString(),
        kind: exam.kind,
        segmentId: exam.segmentId.toString(),
        subSegmentId: exam.subSegmentId.toString(),
      }))}
      programKind="exam"
    />
  );
}
