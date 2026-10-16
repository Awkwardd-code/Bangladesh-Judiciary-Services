"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  FilePlus2,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WrittenExamEditor } from "@/components/admin/written-exam-editor";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

type ExamKind = "preliminary" | "written";
type ExamStatus = "draft" | "published" | "archived";

type CourseLocation = {
  _id?: string;
  title: string;
  order?: number;
  subSegments?: Array<{ _id?: string; title: string; order?: number }>;
};

type CourseRecord = {
  id?: string;
  _id?: string;
  title: string;
  category?: string;
  programKind?: "course" | "exam";
  segments?: CourseLocation[];
  topics?: Array<{ _id?: string; title: string }>;
};

type ManagedExam = {
  _id: string;
  title: string;
  description?: string;
  kind: ExamKind;
  source: "unified" | "preliminary" | "written";
  status: ExamStatus;
  courseId?: string;
  segmentId?: string;
  topicId?: string;
  subSegmentId?: string;
  segmentTitle?: string;
  subSegmentTitle?: string;
  durationMinutes: number;
  totalQuestions: number;
  questionsPerAttempt?: number;
  isLocked?: boolean;
};

type Pagination = {
  totalPages: number;
};

type ApiResult<T> = {
  error?: string;
  data?: T;
};

type ExamLocation = {
  segmentId: string;
  segmentTitle: string;
  subSegmentId: string;
  subSegmentTitle: string;
};

function idOf(value?: string) {
  return value ?? "";
}

async function readJson<T>(response: Response) {
  const result = (await response.json()) as ApiResult<T>;

  if (!response.ok) {
    throw new Error(result.error ?? "Unable to load exam management data.");
  }

  return result.data;
}

async function loadAllPages<T>(endpoint: string, signal?: AbortSignal) {
  const records: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams({ page: String(page), limit: "100" });
    const separator = endpoint.includes("?") ? "&" : "?";
    const data = await readJson<{ exams?: T[]; pagination?: Pagination }>(
      await fetch(`${endpoint}${separator}${params.toString()}`, { signal })
    );

    if (!data?.exams || !data.pagination) {
      throw new Error("The exam list response was incomplete.");
    }

    records.push(...data.exams);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  return records;
}

function locateExam(exam: ManagedExam, course?: CourseRecord): ExamLocation {
  const segments = course?.segments ?? [];
  const bySubSegment = segments
    .map((segment) => ({
      segment,
      subSegment: segment.subSegments?.find(
        (item) => idOf(item._id) === exam.subSegmentId
      ),
    }))
    .find((item) => item.subSegment);

  const topicTitle = course?.topics?.find(
    (topic) => idOf(topic._id) === exam.topicId
  )?.title;
  const segment =
    segments.find((item) => idOf(item._id) === exam.segmentId) ??
    bySubSegment?.segment ??
    segments.find((item) => item.title === (topicTitle ?? exam.segmentTitle));
  const subSegment =
    bySubSegment?.subSegment ??
    segment?.subSegments?.find(
      (item) =>
        idOf(item._id) === exam.subSegmentId ||
        item.title === exam.subSegmentTitle
    );

  return {
    segmentId: idOf(segment?._id) || exam.segmentId || exam.topicId || "",
    segmentTitle:
      segment?.title ?? exam.segmentTitle ?? topicTitle ?? "Unassigned module",
    subSegmentId: idOf(subSegment?._id) || exam.subSegmentId || "",
    subSegmentTitle:
      subSegment?.title ??
      exam.subSegmentTitle ??
      "Unassigned week or division",
  };
}

function ExamStatusBadge({ status }: { status: ExamStatus }) {
  const color =
    status === "published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "archived"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-border bg-muted/10 text-muted";
  return <Badge className={color}>{status}</Badge>;
}

function isExamLocked(exam: ManagedExam) {
  return (
    exam.isLocked ??
    exam.totalQuestions < Math.max(1, exam.questionsPerAttempt ?? 0)
  );
}

function ExamRow({
  exam,
  onStatusChange,
  onDelete,
  busy,
}: {
  exam: ManagedExam;
  onStatusChange: (exam: ManagedExam) => void;
  onDelete: (exam: ManagedExam) => void;
  busy: boolean;
}) {
  const questionUrl =
    exam.source === "written"
      ? `/admin/mock-exams/written/${exam._id}`
      : exam.source === "preliminary"
        ? `/admin/mock-exams/preliminary/${exam._id}`
        : `/admin/exams/${exam._id}`;
  const settingsUrl = `${questionUrl}?tab=settings`;
  const targetQuestions = exam.questionsPerAttempt || exam.totalQuestions;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-primary">{exam.title}</h4>
          <Badge
            className={
              exam.kind === "preliminary"
                ? "border-sky-200 bg-sky-50 text-sky-800"
                : "border-violet-200 bg-violet-50 text-violet-800"
            }
          >
            {exam.kind === "preliminary" ? "Preliminary" : "Written"}
          </Badge>
          <ExamStatusBadge status={exam.status} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {exam.description || "No description added."}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>{exam.totalQuestions} questions</span>
          <span>{exam.durationMinutes} minutes</span>
          {isExamLocked(exam) ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-700">
              <CircleAlert size={13} />
              Locked until questions are ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <ShieldCheck size={13} />
              Questions ready
            </span>
          )}
          {targetQuestions > 0 && targetQuestions !== exam.totalQuestions ? (
            <span>Attempt size: {targetQuestions}</span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link
          href={questionUrl}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-cream hover:bg-primary/90"
        >
          <ListChecks size={15} />
          Manage questions
        </Link>
        <Link
          href={settingsUrl}
          aria-label={`Edit ${exam.title}`}
          title="Edit exam settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary hover:bg-primary/5"
        >
          <Pencil size={15} />
        </Link>
        <button
          type="button"
          onClick={() => onStatusChange(exam)}
          disabled={busy}
          className="h-9 rounded-md border border-border px-3 text-sm text-primary hover:bg-primary/5 disabled:opacity-50"
        >
          {busy
            ? "Saving…"
            : exam.status === "published"
              ? "Unpublish"
              : exam.status === "archived"
                ? "Restore"
                : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(exam)}
          aria-label={`Delete ${exam.title}`}
          title="Delete exam"
          disabled={busy}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

export function CourseExamManager() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [exams, setExams] = useState<ManagedExam[]>([]);
  const [courseId, setCourseId] = useState("all");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyExamId, setBusyExamId] = useState("");
  const [writtenEditorOpen, setWrittenEditorOpen] = useState(false);
  const [writtenAssociation, setWrittenAssociation] = useState<{
    courseId: string;
    topicId?: string;
    subSegmentId?: string;
  }>();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const [courseData, unified, preliminary, written] = await Promise.all([
        readJson<{ courses?: CourseRecord[] }>(
          await fetch("/api/admin/courses", { signal })
        ),
        loadAllPages<Omit<ManagedExam, "source">>("/api/admin/exams", signal),
        loadAllPages<Omit<ManagedExam, "kind" | "source">>(
          "/api/admin/preliminary-exams",
          signal
        ),
        loadAllPages<Omit<ManagedExam, "kind" | "source">>(
          "/api/admin/written-exams",
          signal
        ),
      ]);

      if (!courseData?.courses) {
        throw new Error("The course list response was incomplete.");
      }

      setCourses(courseData.courses);
      setExams([
        ...unified.map((exam) => ({ ...exam, source: "unified" as const })),
        ...preliminary.map((exam) => ({
          ...exam,
          kind: "preliminary" as const,
          source: "preliminary" as const,
        })),
        ...written.map((exam) => ({
          ...exam,
          kind: "written" as const,
          source: "written" as const,
        })),
      ]);
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load exam management data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => controller.abort();
  }, [loadData, reloadKey]);

  const courseById = useMemo(
    () =>
      new Map(courses.map((course) => [course.id ?? idOf(course._id), course])),
    [courses]
  );

  const filteredExams = useMemo(
    () =>
      exams.filter((exam) => {
        if (courseId !== "all" && exam.courseId !== courseId) return false;
        if (kind !== "all" && exam.kind !== kind) return false;
        if (status !== "all" && exam.status !== status) return false;
        const course = courseById.get(exam.courseId ?? "");
        const location = locateExam(exam, course);
        const query = search.trim().toLowerCase();
        return (
          !query ||
          `${exam.title} ${exam.description ?? ""} ${course?.title ?? ""} ${location.segmentTitle} ${location.subSegmentTitle}`
            .toLowerCase()
            .includes(query)
        );
      }),
    [courseById, courseId, exams, kind, search, status]
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, Map<string, Map<string, ManagedExam[]>>>();
    const locations = new Map<
      string,
      Map<string, { segmentTitle: string; subSegmentTitle: string }>
    >();

    for (const exam of filteredExams) {
      const courseKey = exam.courseId || "unassigned";
      const location = locateExam(exam, courseById.get(courseKey));
      const segmentKey = location.segmentId || location.segmentTitle;
      const weekKey = location.subSegmentId || location.subSegmentTitle;
      const courseGroup = groups.get(courseKey) ?? new Map();
      const segmentGroup = courseGroup.get(segmentKey) ?? new Map();
      const weekGroup = segmentGroup.get(weekKey) ?? [];
      weekGroup.push(exam);
      segmentGroup.set(weekKey, weekGroup);
      courseGroup.set(segmentKey, segmentGroup);
      groups.set(courseKey, courseGroup);

      const courseLocations = locations.get(courseKey) ?? new Map();
      courseLocations.set(`${segmentKey}:${weekKey}`, {
        segmentTitle: location.segmentTitle,
        subSegmentTitle: location.subSegmentTitle,
      });
      locations.set(courseKey, courseLocations);
    }

    return { groups, locations };
  }, [courseById, filteredExams]);

  async function changeStatus(exam: ManagedExam) {
    setBusyExamId(exam._id);
    setError("");
    try {
      const endpoint =
        exam.source === "written"
          ? `/api/admin/written-exams/${exam._id}`
          : exam.source === "preliminary"
            ? `/api/admin/preliminary-exams/${exam._id}`
            : `/api/admin/exams/${exam._id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: exam.status === "published" ? "draft" : "published",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update exam status.");
      }
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update exam status."
      );
    } finally {
      setBusyExamId("");
    }
  }

  async function deleteExam(exam: ManagedExam) {
    if (!window.confirm(`Delete ${exam.title} and its submissions?`)) {
      return;
    }

    setBusyExamId(exam._id);
    setError("");
    try {
      const endpoint =
        exam.source === "written"
          ? `/api/admin/written-exams/${exam._id}`
          : exam.source === "preliminary"
            ? `/api/admin/preliminary-exams/${exam._id}`
            : `/api/admin/exams/${exam._id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete exam.");
      }
      setReloadKey((current) => current + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete exam."
      );
    } finally {
      setBusyExamId("");
    }
  }

  function openWrittenEditor(
    course: CourseRecord,
    segment: CourseLocation,
    subSegment?: { _id?: string; title: string }
  ) {
    const courseKey = course.id ?? idOf(course._id);
    const matchingTopic = course.topics?.find(
      (topic) => topic.title === segment.title
    );
    setWrittenAssociation({
      courseId: courseKey,
      topicId: idOf(matchingTopic?._id) || undefined,
      subSegmentId: idOf(subSegment?._id) || undefined,
    });
    setWrittenEditorOpen(true);
  }

  function toggleSection(key: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const publishedCount = filteredExams.filter(
    (exam) => exam.status === "published"
  ).length;
  const lockedCount = filteredExams.filter(isExamLocked).length;

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Course workspace
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-primary lg:text-4xl">
            Exam management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Find exams by course and week, check question readiness, and open
            the question editor directly.
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-cream hover:bg-primary/90"
        >
          <Plus size={16} />
          New preliminary exam
        </Link>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Exams in view</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {filteredExams.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Published</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Locked pending questions</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {lockedCount}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[minmax(230px,1.5fr)_repeat(3,minmax(150px,1fr))]">
        <label className="relative block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exams, weeks, or courses"
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <Select
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          aria-label="Filter exams by course"
          className="w-full"
        >
          <option value="all">All courses</option>
          {courses.map((course) => {
            const id = course.id ?? idOf(course._id);
            return (
              <option key={id} value={id}>
                {course.title}
              </option>
            );
          })}
        </Select>
        <Select
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          aria-label="Filter exams by type"
          className="w-full"
        >
          <option value="all">All exam types</option>
          <option value="preliminary">Preliminary</option>
          <option value="written">Written</option>
        </Select>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter exams by status"
          className="w-full"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-12 text-sm text-muted">
          <LoaderCircle size={18} className="animate-spin" />
          Loading courses and exams…
        </div>
      ) : grouped.groups.size === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center">
          <BookOpen size={28} className="mx-auto text-muted" />
          <p className="mt-3 font-medium text-primary">No matching exams</p>
          <p className="mt-1 text-sm text-muted">
            Adjust the filters or create an exam for a course.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {[...grouped.groups.entries()].map(([courseKey, segmentGroups]) => {
            const course = courseById.get(courseKey);
            const count = [...segmentGroups.values()].reduce(
              (total, weeks) =>
                total +
                [...weeks.values()].reduce(
                  (weekTotal, weekExams) => weekTotal + weekExams.length,
                  0
                ),
              0
            );
            return (
              <section
                key={courseKey}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/[0.03] px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl font-bold text-primary">
                        {course?.title ?? "Unassigned course"}
                      </h2>
                      {course?.category ? (
                        <Badge className="border-border bg-muted/10 text-muted">
                          {course.category}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {count} {count === 1 ? "exam" : "exams"}
                      {course?.programKind === "exam" ? " · Exam course" : ""}
                    </p>
                  </div>
                  {course ? (
                    <Link
                      href="/admin/exams/new"
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-primary hover:bg-primary/5"
                    >
                      <FilePlus2 size={15} />
                      New preliminary
                    </Link>
                  ) : null}
                </header>

                <div className="divide-y divide-border">
                  {[...segmentGroups.entries()].map(
                    ([segmentKey, weekGroups]) => {
                      const segmentTitle =
                        [...weekGroups.entries()]
                          .map(
                            ([weekKey]) =>
                              grouped.locations
                                .get(courseKey)
                                ?.get(`${segmentKey}:${weekKey}`)?.segmentTitle
                          )
                          .find(Boolean) ?? "Unassigned module";
                      const segmentCount = [...weekGroups.values()].reduce(
                        (total, list) => total + list.length,
                        0
                      );
                      const sectionKey = `${courseKey}:${segmentKey}`;
                      const isOpen = openSections.has(sectionKey);

                      return (
                        <section key={segmentKey}>
                          <button
                            type="button"
                            onClick={() => toggleSection(sectionKey)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-primary/[0.025]"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              {isOpen ? (
                                <ChevronDown
                                  size={17}
                                  className="shrink-0 text-muted"
                                />
                              ) : (
                                <ChevronRight
                                  size={17}
                                  className="shrink-0 text-muted"
                                />
                              )}
                              <span className="truncate font-semibold text-primary">
                                {segmentTitle}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              {segmentCount} exams
                            </span>
                          </button>
                          {isOpen ? (
                            <div className="space-y-4 border-t border-border bg-background/40 p-4 sm:p-5">
                              {[...weekGroups.entries()].map(
                                ([weekKey, weekExams]) => {
                                  const location = grouped.locations
                                    .get(courseKey)
                                    ?.get(`${segmentKey}:${weekKey}`);
                                  const locationSegment =
                                    course?.segments?.find(
                                      (item) =>
                                        idOf(item._id) === segmentKey ||
                                        item.title === location?.segmentTitle
                                    );
                                  const week =
                                    locationSegment?.subSegments?.find(
                                      (item) =>
                                        idOf(item._id) === weekKey ||
                                        item.title === location?.subSegmentTitle
                                    );

                                  return (
                                    <section
                                      key={weekKey}
                                      className="rounded-lg border border-border bg-card p-4"
                                    >
                                      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="font-semibold text-primary">
                                          {location?.subSegmentTitle ??
                                            "Unassigned week or division"}
                                        </h3>
                                        {course && locationSegment ? (
                                          <div className="flex flex-wrap gap-2">
                                            <Link
                                              href={`/admin/exams/new?${new URLSearchParams(
                                                {
                                                  courseId: courseKey,
                                                  segmentId: idOf(
                                                    locationSegment._id
                                                  ),
                                                  ...(week?._id
                                                    ? {
                                                        subSegmentId: idOf(
                                                          week._id
                                                        ),
                                                      }
                                                    : {}),
                                                }
                                              ).toString()}`}
                                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-primary hover:bg-primary/5"
                                            >
                                              <Plus size={13} />
                                              Preliminary
                                            </Link>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openWrittenEditor(
                                                  course,
                                                  locationSegment,
                                                  week
                                                )
                                              }
                                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-primary hover:bg-primary/5"
                                            >
                                              <Plus size={13} />
                                              Written
                                            </button>
                                          </div>
                                        ) : null}
                                      </header>
                                      <div className="space-y-3">
                                        {weekExams.map((exam) => (
                                          <ExamRow
                                            key={`${exam.kind}-${exam._id}`}
                                            exam={exam}
                                            onStatusChange={changeStatus}
                                            onDelete={deleteExam}
                                            busy={busyExamId === exam._id}
                                          />
                                        ))}
                                      </div>
                                    </section>
                                  );
                                }
                              )}
                            </div>
                          ) : null}
                        </section>
                      );
                    }
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <WrittenExamEditor
        open={writtenEditorOpen}
        onOpenChange={setWrittenEditorOpen}
        onSaved={() => setReloadKey((current) => current + 1)}
        initialAssociation={writtenAssociation}
      />
    </section>
  );
}
