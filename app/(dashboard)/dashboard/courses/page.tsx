import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { EnrolledCoursesClient } from "@/components/dashboard/enrolled-courses-client";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol, enrollmentsCol } from "@/lib/collections";

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

  const courseMap = new Map(
    courses.map((course) => [course._id.toString(), course])
  );
  const enrolled = enrollments
    .map((item) => ({
      enrollment: item,
      course: courseMap.get(item.courseId.toString()),
    }))
    .filter((item) => item.course)
    .map((item) => ({
      enrollment: { status: item.enrollment.status },
      course: {
        _id: item.course!._id.toString(),
        title: item.course!.title,
        slug: item.course!.slug,
        programKind: item.course!.programKind ?? "course",
        description: item.course!.description,
        coverUrl: item.course!.coverUrl ?? null,
        category: item.course!.category,
        durationLabel: item.course!.durationLabel,
        price: item.course!.price,
      },
    }));

  return <EnrolledCoursesClient courses={enrolled} />;
}
