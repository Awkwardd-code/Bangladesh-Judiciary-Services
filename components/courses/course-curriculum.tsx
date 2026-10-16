"use client";

import Link from "next/link";
import {
  ChevronDown,
  FileText,
  Folder,
  LockKeyhole,
  PlaySquare,
} from "lucide-react";

import type { CourseDetail } from "@/components/courses/course-detail-types";

type CourseTest = NonNullable<CourseDetail["tests"]>[number];

function groupTestsByDivision(tests: CourseTest[]) {
  const divisions = new Map<string, CourseTest[]>();

  for (const test of tests) {
    const title =
      /^(?:Preliminary|Written) Exam\s*[—–-]\s*(.+)$/i.exec(test.title)?.[1] ??
      test.title;
    const divisionTests = divisions.get(title) ?? [];
    divisionTests.push(test);
    divisions.set(title, divisionTests);
  }

  return [...divisions.entries()]
    .map(([title, exams]) => ({ title, exams }))
    .sort((left, right) =>
      left.title.localeCompare(right.title, undefined, { numeric: true }),
    );
}

export function CourseCurriculum({
  course,
  isExamCourse = false,
  hasAccess = false,
}: {
  course: Pick<CourseDetail, "segments" | "slug" | "tests">;
  isExamCourse?: boolean;
  hasAccess?: boolean;
}) {
  const modules = [...course.segments].sort(
    (left, right) => left.order - right.order
  );
  const itemCount = modules.reduce(
    (sum, module) => sum + module.subSegments.length,
    0,
  );

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:mt-10 sm:p-6 lg:p-8">
      <header className="mb-6 space-y-2 sm:mb-7">
      <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
        {isExamCourse ? "Test Details" : "Course Content"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {modules.length} {isExamCourse ? "segments" : "modules"} · {itemCount}{" "}
        {isExamCourse ? "weeks" : "lessons"}
      </p>
      </header>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">
          {isExamCourse
            ? "Test details will be published soon."
            : "Curriculum will be published soon."}
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => {
            const moduleIsAccessible = hasAccess || module.isFree;

            return (
              <details
                key={module._id}
                open={index === 0}
                className="group rounded-xl border border-border bg-white p-2.5 shadow-sm sm:p-3"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3.5 transition-colors hover:bg-primary/[0.03] sm:px-4 [&::-webkit-details-marker]:hidden">
                  <Folder aria-hidden="true" size={17} className="shrink-0 text-blue-600" />
                  <span className="min-w-0 flex-1 font-semibold text-primary">
                    {module.title}
                  </span>
                  {!moduleIsAccessible ? (
                    <LockKeyhole
                      aria-label="Locked"
                      size={15}
                      className="mr-2 shrink-0 text-red-500"
                    />
                  ) : module.isFree ? (
                    <span className="mr-2 text-xs font-medium text-emerald-600">Free</span>
                  ) : null}
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="shrink-0 text-blue-600 transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="space-y-3 px-2 pb-2 pt-3 sm:px-4 sm:pt-4">
                  {module.description ? (
                    <p className="px-2 pb-2 text-sm leading-6 text-muted">
                      {module.description}
                    </p>
                  ) : null}
                  {module.subSegments.map((item) => {
                    const itemIsAccessible = hasAccess || module.isFree || item.isFree;
                    const itemTests = (course.tests ?? []).filter(
                      (test) =>
                        test.segmentId === module._id &&
                        test.subSegmentId === item._id,
                    );
                    const divisions = groupTestsByDivision(itemTests);
                    const hasVideo =
                      Boolean(item.payload.videoUrl) ||
                      Boolean(item.payload.recordingUrl);
                    const hasNote = Boolean(item.hasClassNote);
                    const showNote =
                      hasNote ||
                      item.kind === "lecture" ||
                      item.kind === "video" ||
                      item.kind === "live" ||
                      item.kind === "material";
                    const videoUrl =
                      item.payload.videoUrl ?? item.payload.recordingUrl;

                    return (
                      <details
                        key={item._id}
                        className="group/item rounded-lg border border-slate-200 bg-slate-100 p-1.5"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-slate-200 sm:px-4 [&::-webkit-details-marker]:hidden">
                          <Folder
                            aria-hidden="true"
                            size={16}
                            className="shrink-0 text-blue-600"
                          />
                          <span className="min-w-0 flex-1 font-medium text-primary">
                            {item.title}
                          </span>
                          {!itemIsAccessible ? (
                            <LockKeyhole
                              aria-label="Locked"
                              size={15}
                              className="shrink-0 text-red-500"
                            />
                          ) : item.isFree ? (
                            <span className="text-xs font-medium text-emerald-600">
                              Free preview
                            </span>
                          ) : null}
                          <ChevronDown
                            aria-hidden="true"
                            size={15}
                            className="shrink-0 text-blue-600 transition-transform group-open/item:rotate-180"
                          />
                        </summary>

                        <div className="space-y-3 px-2 pb-2 pt-3 sm:px-3">
                          {item.description ? (
                            <p className="px-2 pb-1 text-sm leading-6 text-muted">
                              {item.description}
                            </p>
                          ) : null}
                          {!isExamCourse && (hasVideo || item.kind !== "note") ? (
                            <ResourceRow
                              href={itemIsAccessible ? videoUrl : undefined}
                              icon="lecture"
                              label={
                                item.kind === "live"
                                  ? "Live Class"
                                  : "Class Lecture"
                              }
                              locked={!itemIsAccessible}
                              available={hasVideo}
                            />
                          ) : null}
                          {!isExamCourse && showNote ? (
                            <ResourceRow
                              href={
                                itemIsAccessible && hasNote
                                  ? `/api/courses/${course.slug}/notes/${item._id}/download`
                                  : undefined
                              }
                              icon="note"
                              label="Class Note"
                              locked={!itemIsAccessible}
                              available={hasNote}
                            />
                          ) : null}
                          {isExamCourse && divisions.length > 0 ? (
                            <div className="space-y-3">
                              {divisions.map((division) => (
                                <details
                                  key={division.title}
                                  className="group/division rounded-lg border border-slate-300 bg-slate-50 p-1.5"
                                >
                                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-white sm:px-4 [&::-webkit-details-marker]:hidden">
                                    <Folder
                                      aria-hidden="true"
                                      size={15}
                                      className="shrink-0 text-blue-600"
                                    />
                                    <span className="min-w-0 flex-1">
                                      {division.title}
                                    </span>
                                    <ChevronDown
                                      aria-hidden="true"
                                      size={14}
                                      className="shrink-0 text-blue-600 transition-transform group-open/division:rotate-180"
                                    />
                                  </summary>
                                  <div className="space-y-2.5 px-2 pb-2 pt-2 sm:px-3">
                                    {(
                                      [
                                        ["preliminary", "Preliminary Exam"],
                                        ["written", "Written Exam"],
                                      ] as const
                                    ).map(([kind, label]) => {
                                      const test = division.exams.find(
                                        (candidate) => candidate.kind === kind,
                                      );
                                      const testHref = test
                                        ? test.source === "written"
                                          ? `/exam/written/${test.id}`
                                          : test.source === "preliminary"
                                            ? `/exam/preliminary/${test.id}`
                                            : `/exam/${test.id}`
                                        : undefined;

                                      return (
                                        <details
                                          key={kind}
                                          className="group/exam-type rounded-lg border border-border bg-white"
                                        >
                                          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
                                            <span className="min-w-0 flex-1">
                                              {label}
                                            </span>
                                            <ChevronDown
                                              aria-hidden="true"
                                              size={14}
                                              className="shrink-0 text-blue-600 transition-transform group-open/exam-type:rotate-180"
                                            />
                                          </summary>
                                          <div className="px-2 pb-2.5">
                                            {test && testHref ? (
                                              <ResourceRow
                                                href={testHref}
                                                icon="lecture"
                                                label={test.title}
                                                locked={
                                                  !itemIsAccessible ||
                                                  Boolean(test.isLocked)
                                                }
                                                available={
                                                  test.totalQuestions > 0 &&
                                                  !test.isLocked
                                                }
                                                badge={
                                                  test.totalQuestions > 0 &&
                                                  !test.isLocked
                                                    ? `${test.totalQuestions} questions`
                                                    : "Questions to be added"
                                                }
                                              />
                                            ) : (
                                              <p className="px-2 py-2 text-sm text-muted">
                                                This exam will be added soon.
                                              </p>
                                            )}
                                          </div>
                                        </details>
                                      );
                                    })}
                                  </div>
                                </details>
                              ))}
                            </div>
                          ) : null}
                          {isExamCourse && divisions.length === 0 ? (
                            <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-muted">
                              Tests for this week will be published soon.
                            </p>
                          ) : null}
                          {!isExamCourse && !hasVideo && !hasNote ? (
                            <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-muted">
                              Course materials will be added soon.
                            </p>
                          ) : null}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ResourceRow({
  href,
  icon,
  label,
  locked,
  available,
  badge,
}: {
  href?: string;
  icon: "lecture" | "note";
  label: string;
  locked: boolean;
  available: boolean;
  badge?: string;
}) {
  const Icon = icon === "note" ? FileText : PlaySquare;
  const className =
    "flex min-h-10 items-center gap-2 rounded-md border border-white/70 bg-slate-100 px-3 py-2 text-sm text-primary";
  const content = (
    <>
      <Icon aria-hidden="true" size={15} className="shrink-0 text-blue-600" />
      <span className="min-w-0 flex-1">{label}</span>
      {badge ? (
        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase">
          {badge}
        </span>
      ) : null}
      {locked ? (
        <LockKeyhole
          aria-label="Locked"
          size={15}
          className="shrink-0 text-red-500"
        />
      ) : available && href ? (
        <span className="text-xs font-medium text-accent">Open</span>
      ) : (
        <span className="text-xs text-muted">Coming soon</span>
      )}
    </>
  );

  if (!locked && available && href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={`${className} hover:bg-white`}>
          {content}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${className} hover:bg-white`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
