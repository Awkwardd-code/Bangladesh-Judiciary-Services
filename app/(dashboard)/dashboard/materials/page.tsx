import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { MaterialsHeader } from "@/components/dashboard/materials-header";
import { MaterialsList, type MaterialGroup } from "@/components/dashboard/materials-list";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol, enrollmentsCol, materialsCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Materials — BJS Prep",
  description: "Reading materials, notes, and resources.",
};

export default async function MaterialsPage() {
  const session = await requireSession();
  if (!session) redirect("/login?next=%2Fdashboard%2Fmaterials");

  const userId = new ObjectId(session.userId);
  const enrollments = await (await enrollmentsCol())
    .find({ userId, status: "approved" })
    .sort({ createdAt: -1 })
    .toArray();
  const enrolledCourseIds = enrollments.map((enrollment) =>
    enrollment.courseId.toString()
  );
  const materialFilter =
    enrolledCourseIds.length > 0
      ? {
          $or: [
            { isFreePreview: true },
            {
              courseId: {
                $in: enrollments.map((enrollment) => enrollment.courseId),
              },
            },
          ],
        }
      : { isFreePreview: true };
  const materials = await (await materialsCol())
    .find(materialFilter)
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  const visibleCourseIds = Array.from(
    new Map(
      materials.map((material) => [
        material.courseId.toString(),
        material.courseId,
      ])
    ).values()
  );
  const courses =
    visibleCourseIds.length > 0
      ? await (await coursesCol())
          .find({
            _id: { $in: visibleCourseIds },
            status: "published",
            isPublished: true,
          })
          .toArray()
      : [];
  const publishedCourseIds = new Set(
    courses.map((course) => course._id.toString())
  );

  const materialsByCourse = new Map<string, typeof materials>();
  for (const material of materials.filter((entry) =>
    publishedCourseIds.has(entry.courseId.toString())
  )) {
    const key = material.courseId.toString();
    const items = materialsByCourse.get(key) ?? [];
    items.push(material);
    materialsByCourse.set(key, items);
  }

  const grouped: MaterialGroup[] = courses.map((course) => ({
    courseId: course._id.toString(),
    courseTitle: course.title,
    courseSlug: course.slug,
    hasAccess: enrolledCourseIds.includes(course._id.toString()),
    materials: (materialsByCourse.get(course._id.toString()) ?? []).map(
      (material) => ({
        id: material._id.toString(),
        title: material.title,
        description: material.description,
        kind: material.kind,
        sizeBytes: material.sizeBytes ?? material.size,
        isFreePreview: Boolean(material.isFreePreview),
      }),
    ),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <MaterialsHeader />
      <MaterialsList grouped={grouped} />
    </div>
  );
}
