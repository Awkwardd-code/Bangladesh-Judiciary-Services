import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";
import { CoursesListClient } from "@/components/admin/courses-list-client";

export const metadata: Metadata = {
  title: "Courses | Admin",
};

export default async function AdminCoursesPage() {
  const session = await requireAdmin();

  if (!session) {
    return null;
  }

  const list = await (await coursesCol())
    .find({ programKind: { $ne: "exam" } })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  return (
    <CoursesListClient
      initialCourses={list.map((course) => ({
        id: course._id.toString(),
        programKind: course.programKind ?? "course",
        title: course.title,
        slug: course.slug,
        coverUrl: course.coverUrl ?? null,
        price: course.price,
        durationLabel: course.durationLabel,
        totalClasses: course.totalClasses,
        totalMockTests: course.totalMockTests,
        isPublished: course.isPublished,
        status: course.status,
        category: course.category,
        order: course.order,
      }))}
    />
  );
}
