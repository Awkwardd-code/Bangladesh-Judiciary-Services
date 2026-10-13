import type { Metadata } from "next";
import type { Sort } from "mongodb";

import { ObjectId } from "mongodb";

import {
  CoursesCatalogSidebar,
  CoursesToolbar,
} from "@/components/public/courses-catalog-controls";
import { CoursesCardGrid } from "@/components/courses/courses-card-grid";
import { CoursesHero } from "@/components/sections/courses-hero";
import { QueryPagination } from "@/components/public/query-pagination";
import { coursesCol, enrollmentsCol } from "@/lib/collections";
import { getSessionFromCookies } from "@/lib/auth";
import type { CourseAccess } from "@/components/courses/course-detail-types";

export const metadata: Metadata = {
  title: "Courses",
  description: "Structured courses for every stage of your BJS preparation.",
};

type CourseSearchParams = {
  search?: string;
  category?: string;
  type?: string;
  sort?: string;
  page?: string;
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<CourseSearchParams>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const category = params.category;
  const type =
    params.type === "free" || params.type === "paid" ? params.type : undefined;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const limit = 9;
  const filter: Record<string, unknown> = {
    isPublished: true,
    status: "published",
    programKind: { $ne: "exam" },
  };

  if (category === "professional") {
    filter.category = { $in: ["BJS", "BAR"] };
  } else if (category === "academic") {
    filter.category = "LLB";
  }

  if (type === "free") {
    filter.price = 0;
  } else if (type === "paid") {
    filter.price = { $gt: 0 };
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tags: { $in: [new RegExp(escaped, "i")] } },
    ];
  }

  const sort: Sort =
    params.sort === "low"
      ? ({ price: 1, order: 1 } as const)
      : params.sort === "high"
        ? ({ price: -1, order: 1 } as const)
        : ({ createdAt: -1 } as const);

  const collection = await coursesCol();
  const [courses, total, session] = await Promise.all([
    collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
    getSessionFromCookies(),
  ]);
  const accessByCourse: Record<string, CourseAccess> = {};

  if (session && courses.length > 0) {
    const courseIds = courses.map((course) => course._id);
    const enrollments = await (
      await enrollmentsCol()
    )
      .find({
        userId: new ObjectId(session.userId),
        courseId: { $in: courseIds },
      })
      .toArray();
    const enrollmentByCourse = new Map(
      enrollments.map((enrollment) => [
        enrollment.courseId.toString(),
        enrollment,
      ])
    );

    for (const course of courses) {
      const enrollment = enrollmentByCourse.get(course._id.toString());
      accessByCourse[course._id.toString()] = enrollment
        ? {
            hasAccess: enrollment.status === "approved",
            reason:
              enrollment.status === "approved"
                ? "approved"
                : enrollment.status === "pending"
                  ? "pending"
                  : "rejected",
          }
        : {
            hasAccess: course.price === 0,
            reason: course.price === 0 ? "free" : "none",
          };
    }
  } else {
    for (const course of courses) {
      accessByCourse[course._id.toString()] = {
        hasAccess: course.price === 0,
        reason: course.price === 0 ? "free" : "none",
      };
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <CoursesHero />
      <section className="bg-cream px-4 pb-8 pt-6 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <CoursesCatalogSidebar />
          <div className="min-w-0">
            <CoursesToolbar total={total} />
            <CoursesCardGrid
              courses={courses}
              accessByCourse={accessByCourse}
            />
          </div>
        </div>
      </section>
      <QueryPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
      />
    </>
  );
}
