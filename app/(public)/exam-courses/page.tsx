import type { Metadata } from "next";
import { ObjectId } from "mongodb";

import type { CourseAccess } from "@/components/courses/course-detail-types";
import { ExamCoursesCatalog } from "@/components/public/exam-courses-catalog";
import { getSessionFromCookies } from "@/lib/auth";
import { coursesCol, enrollmentsCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Exam Courses",
  description:
    "Free and paid exam preparation batches with structured tests and routines.",
};

export default async function ExamCoursesPage() {
  const collection = await coursesCol();
  const [courses, session] = await Promise.all([
    collection
      .find({
        programKind: "exam",
        isPublished: true,
        status: "published",
      })
      .sort({ order: 1, createdAt: -1 })
      .toArray(),
    getSessionFromCookies(),
  ]);

  const accessByCourse: Record<string, CourseAccess> = {};
  if (session && courses.length > 0) {
    const enrollments = await (
      await enrollmentsCol()
    )
      .find({
        userId: new ObjectId(session.userId),
        courseId: { $in: courses.map((course) => course._id) },
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
            hasAccess: false,
            reason: "none",
          };
    }
  } else {
    for (const course of courses) {
      accessByCourse[course._id.toString()] = {
        hasAccess: false,
        reason: "none",
      };
    }
  }

  return (
    <>
      <section className="bg-primary px-4 py-14 text-cream sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-on-dark">
                YOUR NEXT STEP
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Exam courses.
                <span className="block text-accent-on-dark">
                  Built around your goal.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-cream/75">
                Choose a focused test batch, build consistency with a structured
                routine, and get ready to perform on exam day.
              </p>
            </div>
            <div className="rounded-xl border border-cream/15 bg-cream/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-on-dark">
                FIND YOUR TRACK
              </p>
              <p className="mt-3 font-heading text-xl font-semibold text-cream">
                One clear path from practice to performance.
              </p>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Browse exam courses by BJS, BAR, or LL.B program and find the
                right batch for your preparation.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ExamCoursesCatalog
        courses={courses.map((course) => ({
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.description,
          coverUrl: course.coverUrl,
          category: course.category,
          price: course.price,
          discountPercent: course.discountPercent,
          durationLabel: course.durationLabel,
          totalMockTests: course.totalMockTests,
        }))}
        accessByCourse={accessByCourse}
      />
    </>
  );
}
