import Link from "next/link";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { MaterialsList } from "@/components/dashboard/materials-list";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol, materialsCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const { slug } = await params;
  const course = await (await coursesCol()).findOne({ slug });
  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted">Course not found.</p>
      </div>
    );
  }

  const access = await getEnrollmentAccess(
    new ObjectId(session.userId),
    course._id,
  );
  const hasAccess = access.hasAccess || course.price === 0;
  const allMaterials = await (await materialsCol())
    .find({ courseId: course._id })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  const visibleMaterials = hasAccess
    ? allMaterials
    : allMaterials.filter((material) => material.isFreePreview);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-primary">
          {course.title}
        </h1>
        <p className="mt-2 text-muted">{course.description}</p>
      </header>

      {!hasAccess ? (
        <section className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold text-primary">
            Course access
          </h2>
          <p className="mt-2 text-sm text-muted">
            {access.reason === "pending"
              ? "Your enrollment is awaiting approval."
              : access.reason === "rejected"
                ? "Your enrollment was rejected."
                : "Enroll in this course to access all materials."}
          </p>
          {access.reason === "none" ? (
            <Link
              href={`/api/courses/${slug}/enroll`}
              className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm text-cream"
            >
              Enroll now — BDT {course.price}
            </Link>
          ) : null}
        </section>
      ) : null}

      <MaterialsList
        grouped={[
          {
            courseId: course._id.toString(),
            courseTitle: course.title,
            courseSlug: course.slug,
            hasAccess,
            materials: visibleMaterials.map((material) => ({
              id: material._id.toString(),
              title: material.title,
              description: material.description,
              kind: material.kind,
              sizeBytes: material.sizeBytes ?? material.size,
              isFreePreview: Boolean(material.isFreePreview),
            })),
          },
        ]}
      />
    </div>
  );
}
