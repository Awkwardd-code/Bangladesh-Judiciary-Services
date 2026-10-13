import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth-guard";
import { coursesCol, examsCol, mentorsCol } from "@/lib/collections";
import { CourseEditor } from "@/components/admin/course-editor";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const courseId = new ObjectId(id);
  const [course, mentors, exams] = await Promise.all([
    (await coursesCol()).findOne({ _id: courseId }),
    (await mentorsCol()).find({ isPublished: true }).sort({ createdAt: -1 }).toArray(),
    (await examsCol())
      .find({ courseId })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <CourseEditor
      course={{
        id: course._id.toString(),
        programKind: course.programKind ?? "course",
        title: course.title,
        slug: course.slug,
        description: course.description,
        longDescription: course.longDescription,
        coverUrl: course.coverUrl,
        coverPublicId: course.coverPublicId,
        category: course.category,
        level: course.level,
        tags: course.tags,
        price: course.price,
        type: course.type,
        discountPercent: course.discountPercent,
        durationWeeks: course.durationWeeks,
        durationLabel: course.durationLabel,
        totalClasses: course.totalClasses,
        totalMockTests: course.totalMockTests,
        totalMaterials: course.totalMaterials,
        topics: (course.topics ?? []).map((topic) => ({
          ...topic,
          _id: topic._id.toString(),
          examIds: topic.examIds.map((examId) => examId.toString()),
        })),
        routine: (course.routine ?? []).map((item) => ({
          ...item,
          scheduledAt: item.scheduledAt.toISOString(),
        })),
        features: course.features,
        modules: course.modules,
        segments: (course.segments ?? []).map((segment) => ({
          ...segment,
          _id: segment._id.toString(),
          examIds: (segment.examIds ?? []).map((examId) => examId.toString()),
          subSegments: (segment.subSegments ?? []).map((subSegment) => ({
            ...subSegment,
            _id: subSegment._id.toString(),
            examIds: (subSegment.examIds ?? []).map((examId) => examId.toString()),
            payload: {
              ...subSegment.payload,
              scheduledAt:
                subSegment.payload.scheduledAt instanceof Date
                  ? subSegment.payload.scheduledAt.toISOString()
                  : subSegment.payload.scheduledAt,
            },
          })),
        })),
        mentorIds: course.mentorIds?.map((mentorId) => mentorId.toString()) ?? [],
        isPublished: course.isPublished,
        status: course.status,
        order: course.order,
      }}
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
        status: exam.status,
      }))}
    />
  );
}
