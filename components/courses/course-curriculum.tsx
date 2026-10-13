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
    <section className="bg-slate-100 py-6">
      <h2 className="font-heading text-2xl font-bold text-primary">
        {isExamCourse ? "Test Details" : "Course Content"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {modules.length} {isExamCourse ? "segments" : "modules"} · {itemCount}{" "}
        {isExamCourse ? "weeks" : "lessons"}
      </p>

      {modules.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
          {isExamCourse
            ? "Test details will be published soon."
            : "Curriculum will be published soon."}
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {modules.map((module, index) => {
            const moduleIsAccessible = hasAccess || module.isFree;

            return (
              <details
                key={module._id}
                open={index === 0}
                className="group rounded-lg border border-border bg-card p-2"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-3 hover:bg-primary/[0.03] [&::-webkit-details-marker]:hidden">
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

                <div className="space-y-2 px-2 pb-2 pt-2 sm:px-4">
                  {module.description ? (
                    <p className="px-2 pb-1 text-sm leading-6 text-muted">
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
                        className="group/item rounded-md bg-slate-200"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-slate-300 [&::-webkit-details-marker]:hidden">
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

                        <div className="space-y-2 px-3 pb-3 pt-2">
                          {item.description ? (
                            <p className="px-2 pb-1 text-xs leading-5 text-muted">
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
                          {isExamCourse && itemTests.length > 0 ? (
                            itemTests.map((test) => (
                              <ResourceRow
                                key={test.id}
                                href={
                                  test.totalQuestions > 0
                                    ? `/exam/${test.id}`
                                    : undefined
                                }
                                icon="lecture"
                                label={test.title}
                                locked={!itemIsAccessible}
                                available={test.totalQuestions > 0}
                                badge={
                                  test.totalQuestions > 0
                                    ? test.kind
                                    : "Questions to be added"
                                }
                              />
                            ))
                          ) : null}
                          {isExamCourse && itemTests.length === 0 ? (
                            <p className="px-2 text-xs text-muted">
                              Tests for this week will be published soon.
                            </p>
                          ) : null}
                          {!isExamCourse && !hasVideo && !hasNote ? (
                            <p className="px-2 text-xs text-muted">
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
