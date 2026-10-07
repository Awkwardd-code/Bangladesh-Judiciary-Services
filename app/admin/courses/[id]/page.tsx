import { ObjectId } from "mongodb";

import { requireAdmin } from "@/lib/auth-guard";
import { coursesCol, materialsCol, mentorsCol } from "@/lib/collections";
import { CourseEditor } from "@/components/admin/course-editor";

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
  const [course, mentors, materials] = await Promise.all([
    (await coursesCol()).findOne({ _id: new ObjectId(id) }),
    (await mentorsCol()).find({ isPublished: true }).sort({ createdAt: -1 }).toArray(),
    (await materialsCol()).find({ courseId: new ObjectId(id) }).sort({ order: 1 }).toArray(),
  ]);

  if (!course) {
    return null;
  }

  return (
    <CourseEditor
      course={{
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        description: course.description,
        longDescription: course.longDescription,
        category: course.category,
        level: course.level,
        tags: course.tags,
        price: course.price,
        discountPercent: course.discountPercent,
        durationWeeks: course.durationWeeks,
        durationLabel: course.durationLabel,
        totalClasses: course.totalClasses,
        totalMockTests: course.totalMockTests,
        totalMaterials: course.totalMaterials,
        features: course.features,
        modules: course.modules,
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
      initialMaterials={materials.map((material) => ({
        _id: material._id.toString(),
        courseId: material.courseId.toString(),
        title: material.title,
        description: material.description,
        kind: material.kind,
        url: material.url,
        publicId: material.publicId,
        sizeBytes: material.sizeBytes ?? material.size,
        isFreePreview: Boolean(material.isFreePreview),
        order: material.order,
      }))}
    />
  );
}
