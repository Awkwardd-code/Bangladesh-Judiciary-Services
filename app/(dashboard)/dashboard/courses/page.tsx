import Link from "next/link";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth-guard";
import { coursesCol, enrollmentsCol } from "@/lib/collections";
import { ObjectId } from "mongodb";

export default async function DashboardCoursesPage() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  const userId = new ObjectId(session.userId);
  const [enrollments, courses] = await Promise.all([
    (await enrollmentsCol()).find({ userId }).sort({ createdAt: -1 }).toArray(),
    (await coursesCol()).find({}).toArray(),
  ]);

  const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));
  const enrolled = enrollments
    .filter((item) => item.status === "approved" || item.status === "pending")
    .map((item) => ({
      ...item,
      course: courseMap.get(item.courseId.toString()),
    }))
    .filter((item) => item.course);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">My courses</h1>
        </div>
        <Link href="/courses" className="rounded-md border border-border px-4 py-2 text-sm text-primary hover:bg-primary/5">
          Browse all courses
        </Link>
      </header>

      {enrolled.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-12 text-center text-muted">
          You have not enrolled in any courses yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {enrolled.map((item) => {
            const course = item.course!;
            const access = item.status === "approved" ? "Continue" : "Awaiting approval";

            return (
              <article key={course._id.toString()} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="h-28 rounded-md bg-primary/5" />
                <h2 className="mt-4 text-lg font-semibold text-primary">{course.title}</h2>
                <p className="mt-2 text-sm text-muted">{course.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted">{course.durationLabel}</span>
                  <Link href={`/courses/${course.slug}`} className="text-sm font-medium text-primary hover:underline">
                    {access}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
