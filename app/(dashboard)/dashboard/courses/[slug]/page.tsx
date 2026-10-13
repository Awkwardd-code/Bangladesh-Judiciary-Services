import Link from "next/link";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol, examsCol } from "@/lib/collections";
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
  const hasAccess =
    access.hasAccess ||
    (course.price === 0 && course.programKind !== "exam");
  const publishedTests =
    course.programKind === "exam"
      ? await (
          await examsCol()
        )
          .find({ courseId: course._id, status: "published" })
          .sort({ order: 1, createdAt: 1 })
          .toArray()
      : [];
  const segments = [...(course.segments ?? [])]
    .sort((left, right) => left.order - right.order)
    .map((segment) => ({
      _id: segment._id.toString(),
      title: segment.title,
      description: segment.description ?? "",
      order: segment.order,
      isFree: segment.isFree,
      price: segment.price ?? 0,
      discountedPrice: segment.discountedPrice,
      examIds: (segment.examIds ?? []).map((examId) => examId.toString()),
      subSegments: [...(segment.subSegments ?? [])]
        .sort((left, right) => left.order - right.order)
        .map((subSegment) => {
          const payload = { ...subSegment.payload };
          const hasClassNote =
            subSegment.kind === "note" && Boolean(payload.pdfUrl);
          delete payload.pdfUrl;
          delete payload.pdfPublicId;

          return {
            _id: subSegment._id.toString(),
            title: subSegment.title,
            description: subSegment.description ?? "",
            order: subSegment.order,
            kind: subSegment.kind,
            isFree: subSegment.isFree,
            hasClassNote,
            examIds: (subSegment.examIds ?? []).map((examId) =>
              examId.toString(),
            ),
            payload: {
              ...payload,
              scheduledAt:
                payload.scheduledAt instanceof Date
                  ? payload.scheduledAt.toISOString()
                  : payload.scheduledAt,
            },
          };
        }),
    }));
  const curriculumCourse = {
    slug: course.slug,
    segments,
    tests: publishedTests.map((test) => ({
      id: test._id.toString(),
      title: test.title,
      kind: test.kind,
      totalQuestions: test.totalQuestions,
      segmentId: test.segmentId.toString(),
      subSegmentId: test.subSegmentId.toString(),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {course.category} ·{" "}
          {course.programKind === "exam" ? "Model test batch" : "Course"}
        </p>
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
              href={`/courses/${slug}#enroll`}
              className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-4 text-sm text-cream"
            >
              {course.price > 0
                ? `Enroll now — BDT ${course.price}`
                : "Enroll now"}
            </Link>
          ) : null}
        </section>
      ) : null}

      <CourseCurriculum
        course={curriculumCourse}
        isExamCourse={course.programKind === "exam"}
        hasAccess={hasAccess}
      />
    </div>
  );
}
