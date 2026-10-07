import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import { PurchasePendingCard } from "@/components/courses/purchase-pending-card";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export default async function PurchasePendingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login?next=%2Fcourses%2F");
  }

  const { slug } = await params;
  const course = await (await coursesCol()).findOne({
    slug,
    isPublished: true,
    status: "published",
  });

  if (!course) {
    redirect("/courses");
  }

  const access = await getEnrollmentAccess(
    new ObjectId(session.userId),
    course._id,
  );

  if (access.reason === "approved") {
    redirect(`/dashboard/courses/${course.slug}`);
  }

  return (
    <PurchasePendingCard
      course={{
        title: course.title,
        price: course.price,
      }}
    />
  );
}
