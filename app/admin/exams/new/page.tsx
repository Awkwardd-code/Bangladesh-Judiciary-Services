import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { ExamCreatePicker } from "@/components/admin/exam-create-picker";
import { ExamEditor } from "@/components/admin/exam-editor";
import { requireAdmin } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "New Exam — Admin — LegalPath Bangladesh",
};

export default async function NewExamPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string;
    segmentId?: string;
    subSegmentId?: string;
  }>;
}) {
  const session = await requireAdmin();
  if (!session) {
    return null;
  }

  const params = await searchParams;

  if (!params.courseId) {
    const courses = await (await coursesCol())
      .find({ isPublished: true, status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    return (
      <ExamCreatePicker
        courses={courses.map((course) => ({
          id: course._id.toString(),
          title: course.title,
          category: course.category,
          programKind: course.programKind ?? "course",
          segments:
            course.segments?.map((segment) => ({
              id: segment._id?.toString() ?? segment.title,
              title: segment.title,
              subSegments:
                segment.subSegments?.map((subSegment) => ({
                  id: subSegment._id?.toString() ?? subSegment.title,
                  title: subSegment.title,
                })) ?? [],
            })) ?? [],
        }))}
      />
    );
  }

  const course = await (await coursesCol()).findOne({
    _id: new ObjectId(params.courseId),
  });

  if (!course) {
    redirect("/admin/exams");
  }

  return (
    <ExamEditor
      courseId={params.courseId}
      segmentId={params.segmentId ?? ""}
      subSegmentId={params.subSegmentId ?? ""}
      onSaved={undefined}
    />
  );
}
