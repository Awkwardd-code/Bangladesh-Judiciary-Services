import type { Metadata } from "next";

import { CourseEditor } from "@/components/admin/course-editor";
import { requireAdmin } from "@/lib/auth-guard";
import { examsCol, mentorsCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "New Course — Admin — LegalPath Bangladesh",
};

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const params = await searchParams;
  const category =
    params.category === "BAR" || params.category === "LLB"
      ? params.category
      : "BJS";

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
        courseId: exam.courseId?.toString(),
        kind: exam.kind,
      }))}
      initialCategory={category}
    />
  );
}
