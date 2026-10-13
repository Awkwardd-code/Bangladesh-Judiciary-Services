import type { Metadata } from "next";

import { CtaBand } from "@/components/sections/cta-band";
import { ProgramsHero } from "@/components/sections/programs-hero";
import { ProgramsTabs } from "@/components/sections/programs-tabs";
import { coursesCol } from "@/lib/collections";
import type { Course } from "@/lib/types/course";

export const metadata: Metadata = {
  title: "Programs — LegalPath Bangladesh",
  description: "Explore BJS, BAR, and LLB programs.",
};

export const revalidate = 60;

type SerializedCourse = Omit<Course, "_id" | "createdAt" | "updatedAt" | "mentorIds"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  mentorIds: string[];
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const paramCode = code?.toUpperCase();
  const activeCode =
    paramCode === "BJS" || paramCode === "BAR" || paramCode === "LLB"
      ? paramCode
      : "BJS";

  const courses = await (
    await coursesCol()
  )
    .find({
      category: activeCode,
      isPublished: true,
      status: "published",
    })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const serializedCourses: SerializedCourse[] = courses.map((course) => ({
    ...course,
    _id: course._id.toString(),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    mentorIds: course.mentorIds.map((memberId) => memberId.toString()),
  }));

  return (
    <>
      <ProgramsHero />
      <ProgramsTabs activeCode={activeCode} courses={serializedCourses} />
      <CtaBand />
    </>
  );
}
