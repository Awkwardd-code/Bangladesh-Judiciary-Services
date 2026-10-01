import Link from "next/link";
import { Lock } from "lucide-react";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const course = await (await coursesCol()).findOne({ slug });

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted">Course not found.</p>
      </div>
    );
  }

  const access = await getEnrollmentAccess(new ObjectId(session.userId), course._id);

  if (course.price > 0 && !access.hasAccess) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={28} />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-primary">{course.title}</h1>
          <p className="mt-3 text-base text-muted">{course.description}</p>
          <p className="mt-4 text-sm text-muted">
            {access.reason === "pending" && "Your enrollment is awaiting approval."}
            {access.reason === "rejected" && "Your enrollment was rejected."}
            {access.reason === "none" && "This is a paid course."}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/courses" className="rounded-md border border-border px-4 py-2 text-sm text-primary">
              Browse courses
            </Link>
            <Link href={`/api/courses/${slug}/enroll`} className="rounded-md bg-primary px-4 py-2 text-sm text-cream">
              Enroll now — BDT {course.price}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const materials = Array.isArray((course as any).materials) ? (course as any).materials : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-primary">{course.title}</h1>
        <p className="mt-2 text-muted">{course.description}</p>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-primary">Materials</h2>
        {materials.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No materials available yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {materials.map((item: any, index: number) => (
              <li key={`${item.title}-${index}`} className="flex items-center justify-between rounded-md border border-border px-3 py-3">
                <span className="text-sm text-foreground">{item.title ?? `Item ${index + 1}`}</span>
                <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-xs text-cream">
                  Continue
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
