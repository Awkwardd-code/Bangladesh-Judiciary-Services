"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CourseContentEditor } from "@/components/admin/course-content-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { SerializedSegment } from "@/lib/types/course";

type SerializedCourse = {
  id?: string;
  programKind?: "course" | "exam";
  title?: string;
  slug?: string;
  description?: string;
  longDescription?: string;
  coverUrl?: string;
  coverPublicId?: string;
  category?: "BJS" | "BAR" | "LLB";
  level?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  price?: number;
  discountPercent?: number;
  durationWeeks?: number;
  durationLabel?: string;
  totalClasses?: number;
  totalMockTests?: number;
  totalMaterials?: number;
  type?: "free" | "paid";
  topics?: Array<{
    _id?: string;
    title: string;
    description: string;
    order: number;
    examIds: string[];
  }>;
  routine?: Array<{
    title: string;
    description: string;
    scheduledAt: string;
  }>;
  features?: Array<{ label: string; value: string; iconName: string }>;
  modules?: Array<{
    title: string;
    description: string;
    order: number;
    estimatedHours: number;
  }>;
  segments?: SerializedSegment[];
  mentorIds?: string[];
  isPublished?: boolean;
  status?: "draft" | "published" | "archived";
  order?: number;
};

type SerializedMentor = {
  id: string;
  name: string;
  title?: string;
  photoUrl?: string | null;
};

function toLocalDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function createSlugSuffix() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

function createCourseSlug(title: string, suffix: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 69)
    .replace(/-+$/g, "");

  return title.trim() ? `${base || "course"}-${suffix}` : "";
}

export function CourseEditor({
  course,
  mentors,
  initialCategory = "BJS",
  exams = [],
  programKind = course?.programKind ?? "course",
}: {
  course: SerializedCourse | null;
  mentors: SerializedMentor[];
  initialCategory?: "BJS" | "BAR" | "LLB";
  programKind?: "course" | "exam";
  exams?: Array<{
    id: string;
    title: string;
    courseId?: string;
    kind?: string;
    segmentId?: string;
    subSegmentId?: string;
    status?: "draft" | "published" | "archived";
  }>;
}) {
  const router = useRouter();
  const [slugSuffix] = useState(
    course?.slug?.match(/-([a-z0-9]{10})$/i)?.[1] ?? createSlugSuffix()
  );
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SerializedCourse>({
    programKind,
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    description: course?.description ?? "",
    longDescription: course?.longDescription ?? "",
    coverUrl: course?.coverUrl ?? "",
    coverPublicId: course?.coverPublicId ?? "",
    category: course?.category ?? initialCategory,
    level: course?.level ?? "intermediate",
    tags: course?.tags ?? [],
    price: course?.price ?? 0,
    type: course?.type ?? "paid",
    discountPercent: course?.discountPercent ?? 0,
    durationWeeks: course?.durationWeeks ?? 8,
    durationLabel: course?.durationLabel ?? "8 weeks",
    totalClasses: course?.totalClasses ?? 0,
    totalMockTests: course?.totalMockTests ?? 0,
    totalMaterials: course?.totalMaterials ?? 0,
    topics: course?.topics ?? [],
    routine: (course?.routine ?? []).map((item) => ({
      ...item,
      scheduledAt: toLocalDateTime(item.scheduledAt),
    })),
    features: course?.features ?? [],
    modules: course?.modules ?? [],
    segments: course?.segments ?? [],
    mentorIds: course?.mentorIds ?? [],
    isPublished: course?.isPublished ?? false,
    status: course?.status ?? "draft",
    order: course?.order ?? 0,
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      segments: course?.segments ?? [],
    }));
  }, [course]);

  const saveCourse = async () => {
    if (saving) {
      return;
    }
    if (
      form.type === "paid" &&
      programKind !== "exam" &&
      form.segments?.length &&
      form.segments.every((segment) => segment.isFree)
    ) {
      setSaveError(
        "Add a paid segment or change this course to Free before saving."
      );
      return;
    }
    setSaveError("");
    if (
      programKind === "exam" &&
      (form.routine ?? []).some(
        (item) => !item.title.trim() || !item.scheduledAt
      )
    ) {
      setSaveError("Each routine entry needs a title and date/time.");
      return;
    }
    if (
      programKind === "exam" &&
      (form.topics ?? []).some((topic) => topic.title.trim().length < 2)
    ) {
      setSaveError("Each exam topic needs a title of at least 2 characters.");
      return;
    }
    if (
      programKind === "exam" &&
      form.type === "paid" &&
      Number(form.price ?? 0) <= 0
    ) {
      setSaveError(
        "Enter a price greater than 0 or set this exam course to Free."
      );
      return;
    }

    setSaving(true);
    try {
      const url = course?.id
        ? `/api/admin/courses/${course.id}`
        : "/api/admin/courses";
      const method = course?.id ? "PATCH" : "POST";

      const segments = form.segments ?? [];
      const price =
        form.type === "free"
          ? 0
          : programKind === "exam"
            ? Number(form.price ?? 0)
            : segments.length > 0
              ? segments.reduce(
                  (total, segment) =>
                    total + (segment.isFree ? 0 : (segment.price ?? 0)),
                  0
                )
              : (form.price ?? 0);
      const routine = (form.routine ?? []).map((item) => ({
        ...item,
        scheduledAt: item.scheduledAt
          ? new Date(item.scheduledAt).toISOString()
          : "",
      }));
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, price, routine }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to save course.");
      }

      const next = payload?.data?.course;

      if (next?.id) {
        if (
          programKind !== "exam" &&
          next.status === "published" &&
          next.isPublished &&
          next.slug
        ) {
          router.push(`/courses/${next.slug}`);
        } else {
          router.push(
            `${programKind === "exam" ? "/admin/exam-courses" : "/admin/courses"}/${next.id}`
          );
        }
      }
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList
          className={`grid w-full max-w-3xl ${programKind === "exam" ? "grid-cols-5" : "grid-cols-4"}`}
        >
          <TabsTrigger value="overview">
            {programKind === "exam" ? "Test Details" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="curriculum">
            {programKind === "exam" ? "Topics" : "Curriculum"}
          </TabsTrigger>
          <TabsTrigger value="mentors">
            {programKind === "exam" ? "Examiner" : "Mentors"}
          </TabsTrigger>
          {programKind === "exam" ? (
            <TabsTrigger value="routine">Routine</TabsTrigger>
          ) : null}
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {programKind === "exam" ? "Exam course" : "Course"}
                </p>
                <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                  {programKind === "exam"
                    ? "Test details"
                    : "Course overview"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Add the course name and thumbnail students will see in the
                  program catalog.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="course-title"
                      className="mb-2 block text-sm font-medium text-primary"
                    >
                      {programKind === "exam" ? "Exam course name" : "Course name"}
                    </label>
                    <Input
                      id="course-title"
                      placeholder={
                        programKind === "exam"
                          ? "e.g. BJS Preliminary Model Test Batch"
                          : "e.g. BJS Preliminary Preparation"
                      }
                      value={form.title ?? ""}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                          slug: createCourseSlug(event.target.value, slugSuffix),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="course-slug"
                      className="mb-2 block text-sm font-medium text-primary"
                    >
                      Course URL
                    </label>
                    <Input
                      id="course-slug"
                      value={form.slug ?? ""}
                      readOnly
                      aria-describedby="course-slug-help"
                      className="bg-muted/5 font-mono text-xs"
                    />
                    <p id="course-slug-help" className="mt-2 text-xs text-muted">
                      Generated from the name with a unique 10-character suffix.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-background p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-primary">
                      Course thumbnail
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Choose a landscape image to identify this{" "}
                      {programKind === "exam" ? "exam course" : "course"}.
                    </p>
                  </div>
                  <ImageUploader
                    value={form.coverUrl || null}
                    publicId={form.coverPublicId || null}
                    onChange={({ url, publicId }) =>
                      setForm((prev) => ({
                        ...prev,
                        coverUrl: url ?? "",
                        coverPublicId: publicId ?? "",
                      }))
                    }
                    folder="bjs-prep/courses"
                    aspect="video"
                    helperText="JPEG, PNG, or WebP. Maximum 5 MB."
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="font-heading text-lg font-semibold text-primary">
                  Description
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Give students a concise summary and more detail about what to expect.
                </p>
              </div>
              <div>
                <label
                  htmlFor="course-description"
                  className="mb-2 block text-sm font-medium text-primary"
                >
                  Short description
                </label>
                <Textarea
                  id="course-description"
                  rows={3}
                  placeholder="A short summary shown on course cards and at the top of the course page."
                  value={form.description ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="course-long-description"
                  className="mb-2 block text-sm font-medium text-primary"
                >
                  Full description
                </label>
                <Textarea
                  id="course-long-description"
                  rows={6}
                  placeholder="Describe the course structure, who it is for, and what students will gain."
                  value={form.longDescription ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      longDescription: event.target.value,
                    }))
                  }
                />
              </div>
            </section>

            <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="font-heading text-lg font-semibold text-primary">
                  Program placement
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Set which program contains this course and manage its visibility.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="course-category"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Program category
                  </label>
                  <select
                    id="course-category"
                    value={form.category ?? "BJS"}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target
                          .value as SerializedCourse["category"],
                      }))
                    }
                    className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                  >
                    <option value="BJS">BJS</option>
                    <option value="BAR">BAR</option>
                    <option value="LLB">LLB</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="course-level"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Difficulty level
                  </label>
                  <select
                    id="course-level"
                    value={form.level ?? "intermediate"}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        level: event.target.value as SerializedCourse["level"],
                      }))
                    }
                    className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="course-status"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Course status
                  </label>
                  <select
                    id="course-status"
                    value={form.status ?? "draft"}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as SerializedCourse["status"],
                      }))
                    }
                    className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4">
                <Checkbox
                  checked={Boolean(form.isPublished)}
                  onCheckedChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: Boolean(value),
                    }))
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-primary">
                    Visible in the public catalog
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    Students can find this course when it is published and its
                    status is set to Published.
                  </span>
                </span>
              </label>
            </section>
          </div>
          {programKind === "exam" ? (
            <section className="mt-5 space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Assessments
                </p>
                <h2 className="mt-1 font-heading text-lg font-semibold text-primary">
                  Test structure
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Organize the tests and segments students will complete in this
                  exam course.
                </p>
              </div>
              <CourseContentEditor
                courseSlug={form.slug ?? ""}
                courseId={course?.id}
                isExamCourse
                segments={form.segments ?? []}
                exams={exams}
                onChange={(segments) =>
                  setForm((prev) => ({ ...prev, segments }))
                }
              />
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="curriculum">
          <div className="space-y-6">
            {programKind !== "exam" ? (
              <>
                <section className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Course plan
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                      Schedule and workload
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Set the expected course length and learning activities.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <label
                        htmlFor="course-duration-weeks"
                        className="mb-2 block text-sm font-medium text-primary"
                      >
                        Duration in weeks
                      </label>
                      <Input
                        id="course-duration-weeks"
                        type="number"
                        min={1}
                        placeholder="e.g. 8"
                        value={form.durationWeeks ?? 0}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            durationWeeks: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="course-duration-label"
                        className="mb-2 block text-sm font-medium text-primary"
                      >
                        Display duration
                      </label>
                      <Input
                        id="course-duration-label"
                        placeholder="e.g. 8 weeks"
                        value={form.durationLabel ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            durationLabel: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="course-total-classes"
                        className="mb-2 block text-sm font-medium text-primary"
                      >
                        Number of classes
                      </label>
                      <Input
                        id="course-total-classes"
                        type="number"
                        min={0}
                        placeholder="e.g. 24"
                        value={form.totalClasses ?? 0}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            totalClasses: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="course-total-tests"
                        className="mb-2 block text-sm font-medium text-primary"
                      >
                        Model tests
                      </label>
                      <Input
                        id="course-total-tests"
                        type="number"
                        min={0}
                        placeholder="e.g. 10"
                        value={form.totalMockTests ?? 0}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            totalMockTests: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="mb-5">
                    <h2 className="font-heading text-lg font-semibold text-primary">
                      Curriculum
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Arrange modules, lessons, and access settings for the course.
                    </p>
                  </div>
                  <CourseContentEditor
                    courseSlug={form.slug ?? ""}
                    courseId={course?.id}
                    segments={form.segments ?? []}
                    exams={exams}
                    onChange={(segments) =>
                      setForm((prev) => ({ ...prev, segments }))
                    }
                  />
                </section>
              </>
            ) : null}
            {programKind === "exam" ? (
              <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Syllabus
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                      Exam topics
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Add the subjects or topic groups covered by this exam course.
                    </p>
                  </div>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                    {(form.topics ?? []).length} topics
                  </span>
                </div>

                {(form.topics ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-background px-5 py-8 text-center">
                    <p className="text-sm font-medium text-primary">
                      No topics added yet
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Add topics to help students understand the exam coverage.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {(form.topics ?? []).map((topic, index) => (
                    <div
                      key={topic._id ?? index}
                      className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto]"
                    >
                      <div>
                        <label
                          htmlFor={`exam-topic-title-${index}`}
                          className="mb-2 block text-xs font-medium text-primary"
                        >
                          Topic {index + 1}
                        </label>
                        <Input
                          id={`exam-topic-title-${index}`}
                          placeholder="e.g. Constitutional law"
                          value={topic.title}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              topics: (prev.topics ?? []).map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, title: event.target.value }
                                    : item
                              ),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`exam-topic-description-${index}`}
                          className="mb-2 block text-xs font-medium text-primary"
                        >
                          Description
                        </label>
                        <Input
                          id={`exam-topic-description-${index}`}
                          placeholder="Optional details about this topic"
                          value={topic.description}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              topics: (prev.topics ?? []).map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        description: event.target.value,
                                      }
                                    : item
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              topics: (prev.topics ?? []).filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      topics: [
                        ...(prev.topics ?? []),
                        {
                          title: "",
                          description: "",
                          order: prev.topics?.length ?? 0,
                          examIds: [],
                        },
                      ],
                    }))
                  }
                >
                  Add exam topic
                </Button>
              </section>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="mentors">
          <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  People
                </p>
                <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                  {programKind === "exam" ? "Examiner team" : "Course mentors"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {programKind === "exam"
                    ? "Choose the examiners associated with this exam course."
                    : "Choose the mentors who will lead or support this course."}
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                {(form.mentorIds ?? []).length} selected
              </span>
            </div>

            {mentors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background px-5 py-8 text-center text-sm text-muted">
                No published mentors are available to select.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mentors.map((mentor) => {
                  const selected = form.mentorIds?.includes(mentor.id);

                  return (
                    <button
                      key={mentor.id}
                      type="button"
                      aria-pressed={Boolean(selected)}
                      onClick={() =>
                        setForm((prev) => {
                          const existing = prev.mentorIds ?? [];
                          const next = existing.includes(mentor.id)
                            ? existing.filter((item) => item !== mentor.id)
                            : [...existing, mentor.id];

                          return {
                            ...prev,
                            mentorIds: next,
                          };
                        })
                      }
                      className={`flex min-h-24 cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-primary">
                          {mentor.name}
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted">
                          {mentor.title || "Mentor"}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          selected
                            ? "bg-primary text-cream"
                            : "bg-card text-muted"
                        }`}
                      >
                        {selected ? "Selected" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </TabsContent>

        {programKind === "exam" ? (
          <TabsContent value="routine">
            <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Schedule
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                    Exam routine
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Add the dates and notes students need to plan their tests.
                  </p>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                  {(form.routine ?? []).length} scheduled
                </span>
              </div>

              {(form.routine ?? []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background px-5 py-8 text-center">
                  <p className="text-sm font-medium text-primary">
                    No routine dates added
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Add a test date to share the schedule with enrolled students.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {(form.routine ?? []).map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-primary">
                        Schedule item {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            routine: (prev.routine ?? []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`routine-title-${index}`}
                          className="mb-2 block text-sm font-medium text-primary"
                        >
                          Test or event name
                        </label>
                        <Input
                          id={`routine-title-${index}`}
                          placeholder="e.g. Preliminary model test 1"
                          value={item.title}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              routine: (prev.routine ?? []).map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? { ...entry, title: event.target.value }
                                    : entry
                              ),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`routine-date-${index}`}
                          className="mb-2 block text-sm font-medium text-primary"
                        >
                          Date and time
                        </label>
                        <Input
                          id={`routine-date-${index}`}
                          type="datetime-local"
                          value={item.scheduledAt}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              routine: (prev.routine ?? []).map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        scheduledAt: event.target.value,
                                      }
                                    : entry
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          htmlFor={`routine-description-${index}`}
                          className="mb-2 block text-sm font-medium text-primary"
                        >
                          Notes for students
                        </label>
                        <Textarea
                          id={`routine-description-${index}`}
                          rows={2}
                          placeholder="Optional instructions or preparation notes"
                          value={item.description}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              routine: (prev.routine ?? []).map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        description: event.target.value,
                                      }
                                    : entry
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    routine: [
                      ...(prev.routine ?? []),
                      { title: "", description: "", scheduledAt: "" },
                    ],
                  }))
                }
              >
                Add routine date
              </Button>
            </section>
          </TabsContent>
        ) : null}

        <TabsContent value="pricing">
          <section className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Enrollment
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-primary">
                Pricing and access
              </h2>
              <p className="mt-1 text-sm text-muted">
                Select how students can join this{" "}
                {programKind === "exam" ? "exam course" : "course"}.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {([
                {
                  value: "free",
                  title: "Free",
                  description: "Students can enroll without making a payment.",
                },
                {
                  value: "paid",
                  title: "Paid",
                  description: "Set a price for access to this course.",
                },
              ] as const).map((option) => {
                const selected = form.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        type: option.value,
                        price: option.value === "free" ? 0 : prev.price,
                        discountPercent:
                          option.value === "free" ? 0 : prev.discountPercent,
                      }))
                    }
                    className={`rounded-xl border p-5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-semibold text-primary">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.type === "paid" ? (
              <div className="grid gap-5 rounded-lg border border-border bg-background p-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="course-price"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    {programKind !== "exam" && form.segments?.length
                      ? "Total segment price (BDT)"
                      : "Course price (BDT)"}
                  </label>
                  <Input
                    id="course-price"
                    type="number"
                    min={1}
                    placeholder="e.g. 2500"
                    value={
                      programKind !== "exam" && form.segments?.length
                        ? form.segments.reduce(
                            (total, segment) =>
                              total +
                              (segment.isFree ? 0 : (segment.price ?? 0)),
                            0
                          )
                        : (form.price ?? 0)
                    }
                    readOnly={
                      programKind !== "exam" && Boolean(form.segments?.length)
                    }
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: Number(event.target.value),
                      }))
                    }
                  />
                  <p className="mt-2 text-xs text-muted">
                    {programKind !== "exam" && form.segments?.length
                      ? "Calculated from paid segments. Change individual segment prices in Curriculum."
                      : "Enter the full course price in Bangladeshi taka."}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="course-discount"
                    className="mb-2 block text-sm font-medium text-primary"
                  >
                    Discount percent
                  </label>
                  <Input
                    id="course-discount"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    value={form.discountPercent ?? 0}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        discountPercent: Number(event.target.value),
                      }))
                    }
                  />
                  <p className="mt-2 text-xs text-muted">
                    Optional discount shown on the course enrollment panel.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                This course will be listed as Free. Students can enroll without
                payment.
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {saveError ? (
        <p role="alert" className="text-sm text-red-700">
          {saveError}
        </p>
      ) : null}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            router.push(
              programKind === "exam" ? "/admin/exam-courses" : "/admin/courses"
            )
          }
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={() => {
            void saveCourse();
          }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
