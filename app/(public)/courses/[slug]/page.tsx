import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import { CourseDescription } from "@/components/courses/course-description";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseHero } from "@/components/courses/course-hero";
import { CourseMaterialsPreview } from "@/components/courses/course-materials-preview";
import { CourseMentors } from "@/components/courses/course-mentors";
import { CourseSidebar } from "@/components/courses/course-sidebar";
import { CourseWhatIncluded } from "@/components/courses/course-what-included";
import { CtaBand } from "@/components/sections/cta-band";
import { ensureIndexes } from "@/lib/indexes";
import { getSessionFromCookies } from "@/lib/auth";
import {
  coursesCol,
  materialsCol,
  mentorsCol,
} from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await (await coursesCol()).findOne({ slug });

  return {
    title: course ? `${course.title} — BJS Prep` : "Course — BJS Prep",
    description: course?.description ?? "",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureIndexes();

  const { slug } = await params;
  const course = await (await coursesCol()).findOne({
    slug,
    status: "published",
    isPublished: true,
  });

  if (!course) {
    notFound();
  }

  const [mentors, materials, session] = await Promise.all([
    (await mentorsCol())
      .find({
        _id: { $in: course.mentorIds ?? [] },
        isPublished: true,
      })
      .sort({ order: 1 })
      .toArray(),
    (await materialsCol())
      .find({ courseId: course._id })
      .sort({ order: 1 })
      .limit(6)
      .toArray(),
    getSessionFromCookies(),
  ]);

  const access = session
    ? await getEnrollmentAccess(new ObjectId(session.userId), course._id)
    : null;
  const serializedCourse = {
    id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    description: course.description,
    longDescription: course.longDescription ?? "",
    coverUrl: course.coverUrl || undefined,
    category: course.category,
    tags: course.tags ?? [],
    level: course.level,
    price: course.price,
    currency: course.currency,
    discountPercent: course.discountPercent,
    durationWeeks: course.durationWeeks,
    durationLabel: course.durationLabel,
    totalClasses: course.totalClasses,
    totalMockTests: course.totalMockTests,
    totalMaterials: course.totalMaterials,
    features: (course.features ?? []).map((feature) => ({
      label: feature.label,
      value: feature.value,
      iconName: feature.iconName,
    })),
    modules: (course.modules ?? []).map((module) => ({
      title: module.title,
      description: module.description,
      order: module.order,
      estimatedHours: module.estimatedHours,
    })),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
  const serializedMentors = mentors.map((mentor) => ({
    id: mentor._id.toString(),
    name: mentor.name,
    title: mentor.title,
    photoUrl: mentor.photoUrl || undefined,
    specializations: mentor.specializations ?? [],
    yearsOfExperience: mentor.yearsOfExperience,
  }));
  const serializedMaterials = materials.map((material) => ({
    id: material._id.toString(),
    title: material.title,
    description: material.description ?? undefined,
    kind: material.kind,
    sizeBytes: material.sizeBytes ?? material.size,
    isFreePreview: Boolean(material.isFreePreview),
  }));
  const serializedAccess = access
    ? { hasAccess: access.hasAccess, reason: access.reason }
    : null;

  return (
    <>
      <CourseHero
        course={serializedCourse}
        mentors={serializedMentors}
      />

      <section className="bg-cream px-6 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CourseDescription course={serializedCourse} />
            <CourseWhatIncluded course={serializedCourse} />
            <CourseCurriculum course={serializedCourse} />
            <CourseMentors mentors={serializedMentors} />
            <CourseMaterialsPreview
              materials={serializedMaterials}
              hasAccess={access?.hasAccess ?? false}
            />
          </div>

          <div className="lg:col-span-4">
            <CourseSidebar
              course={serializedCourse}
              isLoggedIn={Boolean(session)}
              access={serializedAccess}
            />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
