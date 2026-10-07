import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import { PaymentFormCard } from "@/components/courses/payment-form-card";
import { PaymentHeader } from "@/components/courses/payment-header";
import { PaymentMethodsCard } from "@/components/courses/payment-methods-card";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await (await coursesCol()).findOne({ slug });

  if (!course) {
    return {
      title: "Complete payment — BJS Prep",
    };
  }

  return {
    title: `Complete payment — ${course.title} — BJS Prep`,
  };
}

export default async function CoursePaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect(`/login?next=/courses/${(await params).slug}/payment`);
  }

  const { slug } = await params;
  const course = await (await coursesCol()).findOne({
    slug,
    isPublished: true,
    status: "published",
  });

  if (!course) {
    notFound();
  }

  const access = await getEnrollmentAccess(
    new ObjectId(session.userId),
    course._id,
  );

  if (access.reason === "approved") {
    redirect(`/dashboard/courses/${course.slug}`);
  }

  if (access.reason === "pending") {
    redirect(`/courses/${course.slug}/purchase-pending`);
  }

  if (course.price === 0) {
    redirect(`/courses/${course.slug}`);
  }

  return (
    <>
      <PaymentHeader course={{ title: course.title, category: course.category }} />
      <PaymentMethodsCard />
      <PaymentFormCard
        course={{
          id: course._id.toString(),
          slug: course.slug,
          title: course.title,
          price: course.price,
          currency: course.currency,
        }}
      />
    </>
  );
}
