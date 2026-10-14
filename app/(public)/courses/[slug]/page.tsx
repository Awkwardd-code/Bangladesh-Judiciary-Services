import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

import { CourseDescription } from "@/components/courses/course-description";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseDetailTabs } from "@/components/courses/course-detail-tabs";
import { CourseExamTopics } from "@/components/courses/course-exam-topics";
import { CourseHero } from "@/components/courses/course-hero";
import { CourseMentors } from "@/components/courses/course-mentors";
import { CtaBand } from "@/components/sections/cta-band";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureIndexes } from "@/lib/indexes";
import { getSessionFromCookies } from "@/lib/auth";
import {
  coursesCol,
  enrollmentsCol,
  examsCol,
  mentorsCol,
} from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await (await coursesCol()).findOne({ slug });

  return {
    title: course ? `${course.title} — LegalPath Bangladesh` : "Course — LegalPath Bangladesh",
    description: course?.description ?? "",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureIndexes();

  const { slug } = await params;
  const course = await (
    await coursesCol()
  ).findOne({
    slug,
    status: "published",
    isPublished: true,
  });

  if (!course) {
    notFound();
  }

  const [mentors, tests, session, studentCount] = await Promise.all([
    (await mentorsCol())
      .find({
        _id: { $in: course.mentorIds ?? [] },
        isPublished: true,
      })
      .sort({ order: 1 })
      .toArray(),
    (await examsCol())
      .find({ courseId: course._id, status: "published" })
      .sort({ order: 1, createdAt: 1 })
      .toArray(),
    getSessionFromCookies(),
    (await enrollmentsCol()).countDocuments({
      courseId: course._id,
      status: "approved",
    }),
  ]);

  const access = session
    ? await getEnrollmentAccess(new ObjectId(session.userId), course._id)
    : null;
  const serializedCourse = {
    id: course._id.toString(),
    programKind: course.programKind ?? "course",
    title: course.title,
    slug: course.slug,
    description: course.description,
    longDescription: course.longDescription ?? "",
    coverUrl: course.coverUrl || undefined,
    category: course.category,
    tags: course.tags ?? [],
    level: course.level,
    price: course.price,
    currency: course.currency,
    discountPercent: course.discountPercent,
    durationWeeks: course.durationWeeks ?? 8,
    durationLabel: course.durationLabel ?? "8 weeks",
    totalClasses: course.totalClasses,
    totalMockTests: course.totalMockTests,
    totalMaterials: course.totalMaterials,
    lessonCount: (course.segments ?? []).reduce(
      (count, segment) =>
        count +
        (segment.subSegments ?? []).filter((item) =>
          ["lecture", "video", "live"].includes(item.kind),
        ).length,
      0,
    ),
    pdfNoteCount: (course.segments ?? []).reduce(
      (count, segment) =>
        count +
        (segment.subSegments ?? []).filter(
          (item) => item.kind === "note" && Boolean(item.payload.pdfUrl),
        ).length,
      0,
    ),
    studentCount,
    features: (course.features ?? []).map((feature) => ({
      label: feature.label,
      value: feature.value,
      iconName: feature.iconName,
    })),
    modules: (course.modules ?? []).map((module) => ({
      title: module.title,
      description: module.description,
      order: module.order,
      estimatedHours: module.estimatedHours,
    })),
    segments: (course.segments ?? []).map((segment) => ({
      _id: segment._id.toString(),
      title: segment.title,
      description: segment.description ?? "",
      order: segment.order,
      isFree: segment.isFree,
      price: segment.price ?? 0,
      discountedPrice: segment.discountedPrice,
      examIds: (segment.examIds ?? []).map((examId) => examId.toString()),
      subSegments: (segment.subSegments ?? []).map((subSegment) => {
        const payload = { ...subSegment.payload };
        delete payload.pdfUrl;
        delete payload.pdfPublicId;
        return {
          _id: subSegment._id.toString(),
          title: subSegment.title,
          description: subSegment.description ?? "",
          order: subSegment.order,
          kind: subSegment.kind,
          isFree: subSegment.isFree,
          hasClassNote:
            subSegment.kind === "note" && Boolean(subSegment.payload.pdfUrl),
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
    })),
    topics: (course.topics ?? [])
      .sort((left, right) => left.order - right.order)
      .map((topic) => ({
        id: topic._id.toString(),
        title: topic.title,
        description: topic.description,
        order: topic.order,
      })),
    routine: (course.routine ?? [])
      .sort(
        (left, right) =>
          left.scheduledAt.getTime() - right.scheduledAt.getTime(),
      )
      .map((item) => ({
        title: item.title,
        description: item.description,
        scheduledAt: item.scheduledAt.toISOString(),
      })),
    tests: tests.map((test) => ({
      id: test._id.toString(),
      title: test.title,
      kind: test.kind,
      totalQuestions: test.totalQuestions,
      segmentId: test.segmentId.toString(),
      subSegmentId: test.subSegmentId.toString(),
    })),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
  if (serializedCourse.segments.length === 0 && course.modules?.length) {
    serializedCourse.segments = course.modules.map((module) => ({
      _id: `legacy-module-${module.order}`,
      title: module.title,
      description: module.description,
      order: module.order,
      isFree: true,
      price: 0,
      discountedPrice: undefined,
      examIds: [],
      subSegments: [],
    }));
  }
  const serializedMentors = mentors.map((mentor) => ({
    id: mentor._id.toString(),
    name: mentor.name,
    title: mentor.title,
    photoUrl: mentor.photoUrl || undefined,
    specializations: mentor.specializations ?? [],
    yearsOfExperience: mentor.yearsOfExperience,
  }));
  const serializedAccess = access
    ? { hasAccess: access.hasAccess, reason: access.reason }
    : null;

  return (
    <>
      <CourseHero
        course={serializedCourse}
        isLoggedIn={Boolean(session)}
        access={serializedAccess}
      >
        {course.programKind === "exam" ? (
              <Tabs defaultValue="test-details" className="min-w-0">
                <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 sm:grid-cols-4">
                  <TabsTrigger value="test-details">Overview</TabsTrigger>
                  <TabsTrigger value="topics">Syllabus & tests</TabsTrigger>
                  <TabsTrigger value="examiners">Examiners</TabsTrigger>
                  <TabsTrigger value="routine">Schedule</TabsTrigger>
                </TabsList>
                <div className="mt-5">
                  <TabsContent value="test-details">
                    <CourseDescription course={serializedCourse} />
                  </TabsContent>
                  <TabsContent value="topics">
                    <CourseExamTopics
                      course={serializedCourse}
                      hasAccess={serializedAccess?.hasAccess ?? false}
                    />
                  </TabsContent>
                  <TabsContent value="examiners">
                    <CourseMentors mentors={serializedMentors} />
                  </TabsContent>
                  <TabsContent value="routine">
                    <section className="space-y-4 py-6">
                      <h2 className="font-heading text-2xl font-bold text-primary">
                        Exam Routine
                      </h2>
                      {serializedCourse.routine.length ? (
                        <ol className="space-y-3">
                          {serializedCourse.routine.map((item, index) => (
                            <li
                              key={`${item.scheduledAt}-${index}`}
                              className="rounded-lg border border-border bg-card p-5"
                            >
                              <time
                                dateTime={item.scheduledAt}
                                className="text-sm font-semibold text-accent"
                              >
                                {new Date(item.scheduledAt).toLocaleString()}
                              </time>
                              <h3 className="mt-1 font-semibold text-primary">{item.title}</h3>
                              {item.description ? (
                                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                          The routine will be published soon.
                        </p>
                      )}
                    </section>
                  </TabsContent>
                </div>
              </Tabs>
        ) : (
          <CourseDetailTabs
            description={<CourseDescription course={serializedCourse} />}
            curriculum={
              <CourseCurriculum
                course={serializedCourse}
                hasAccess={serializedAccess?.hasAccess ?? false}
              />
            }
            instructor={<CourseMentors mentors={serializedMentors} />}
            routine={
                  <section className="space-y-4 py-6">
                    <h2 className="font-heading text-2xl font-bold text-primary">
                      Course Routine
                    </h2>
                    {serializedCourse.routine.length ? (
                      <ol className="space-y-3">
                        {serializedCourse.routine.map((item, index) => (
                          <li
                            key={`${item.scheduledAt}-${index}`}
                            className="rounded-lg border border-border bg-card p-5"
                          >
                            <time
                              dateTime={item.scheduledAt}
                              className="text-sm font-semibold text-accent"
                            >
                              {new Date(item.scheduledAt).toLocaleString()}
                            </time>
                            <h3 className="mt-1 font-semibold text-primary">
                              {item.title}
                            </h3>
                            {item.description ? (
                              <p className="mt-2 text-sm leading-6 text-muted">
                                {item.description}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted">
                        The course routine will be published soon.
                      </p>
                    )}
                  </section>
            }
          />
        )}
      </CourseHero>

      <CtaBand />
    </>
  );
}
