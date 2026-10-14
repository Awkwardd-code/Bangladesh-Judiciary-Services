import Link from "next/link";
import {
  ChevronDown,
  FileText,
  Folder,
  LockKeyhole,
} from "lucide-react";

import type { CourseDetail } from "@/components/courses/course-detail-types";

export function CourseExamTopics({
  course,
  hasAccess,
}: {
  course: CourseDetail;
  hasAccess: boolean;
}) {
  const topics = [...(course.topics ?? [])].sort(
    (left, right) => left.order - right.order,
  );
  const segments = [...course.segments].sort(
    (left, right) => left.order - right.order,
  );

  return (
    <section className="space-y-4 py-6">
      <h2 className="font-heading text-2xl font-bold text-primary">
        Exam Topics
      </h2>
      {topics.length ? (
        <div className="space-y-2">
          {topics.map((topic, topicIndex) => {
            const segment = segments.find(
              (item) => item.order === topic.order,
            ) ?? segments[topicIndex];

            return (
              <details
                key={topic.id}
                open={topicIndex === 0}
                className="group rounded-lg border border-border bg-card p-2"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-3 hover:bg-primary/[0.03] [&::-webkit-details-marker]:hidden">
                  <Folder
                    aria-hidden="true"
                    size={17}
                    className="shrink-0 text-blue-600"
                  />
                  <span className="min-w-0 flex-1 font-semibold text-primary">
                    {topic.title}
                  </span>
                  {segment && !hasAccess && !segment.isFree ? (
                    <span className="mr-2 text-xs text-muted">Enrolled students</span>
                  ) : segment?.isFree ? (
                    <span className="mr-2 text-xs font-medium text-emerald-600">
                      Free
                    </span>
                  ) : null}
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="shrink-0 text-blue-600 transition-transform group-open:rotate-180"
                  />
                </summary>

                <div className="space-y-2 px-2 pb-2 pt-2 sm:px-4">
                  {(segment?.subSegments ?? []).map((week, weekIndex) => {
                    const weekIsAccessible =
                      hasAccess || Boolean(segment?.isFree) || week.isFree;
                    const tests = (course.tests ?? []).filter(
                      (test) =>
                        test.segmentId === segment?._id &&
                        test.subSegmentId === week._id,
                    );
                    const topicTitle =
                      topic.description
                        .split(";")
                        .map((item) => item.trim())
                        .filter(Boolean)[weekIndex] ?? week.title;

                    return (
                      <details
                        key={week._id}
                        className="group/week rounded-md bg-slate-200"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-slate-300 [&::-webkit-details-marker]:hidden">
                          <Folder
                            aria-hidden="true"
                            size={16}
                            className="shrink-0 text-blue-600"
                          />
                          <span className="min-w-0 flex-1 font-medium text-primary">
                            {topicTitle}
                          </span>
                          {!weekIsAccessible ? (
                            <LockKeyhole
                              aria-label="Locked"
                              size={15}
                              className="shrink-0 text-red-500"
                            />
                          ) : week.isFree ? (
                            <span className="text-xs font-medium text-emerald-600">
                              Free
                            </span>
                          ) : null}
                          <ChevronDown
                            aria-hidden="true"
                            size={15}
                            className="shrink-0 text-blue-600 transition-transform group-open/week:rotate-180"
                          />
                        </summary>

                        <div className="space-y-2 px-3 pb-3 pt-2">
                          {week.description ? (
                            <p className="px-2 pb-1 text-xs leading-5 text-muted">
                              {week.description}
                            </p>
                          ) : null}
                          {tests.length ? (
                            tests.map((test) => {
                              const content = (
                                <>
                                  <FileText
                                    aria-hidden="true"
                                    size={15}
                                    className="shrink-0 text-blue-600"
                                  />
                                  <span className="min-w-0 flex-1">
                                    {test.title}
                                  </span>
                                  <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase">
                                    {test.totalQuestions > 0
                                      ? test.kind
                                      : "Questions to be added"}
                                  </span>
                                  {!weekIsAccessible ? (
                                    <LockKeyhole
                                      aria-label="Locked"
                                      size={15}
                                      className="shrink-0 text-red-500"
                                    />
                                  ) : null}
                                </>
                              );
                              const className =
                                "flex min-h-10 items-center gap-2 rounded-md border border-white/70 bg-slate-100 px-3 py-2 text-sm text-primary";

                              return test.totalQuestions > 0 &&
                                weekIsAccessible ? (
                                <Link
                                  key={test.id}
                                  href={`/exam/${test.id}`}
                                  className={`${className} hover:bg-white`}
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div key={test.id} className={className}>
                                  {content}
                                </div>
                              );
                            })
                          ) : (
                            <p className="px-2 text-xs text-muted">
                              Topics and practice tests for this week will be added soon.
                            </p>
                          )}
                        </div>
                      </details>
                    );
                  })}
                  {!segment?.subSegments.length && (
                    <p className="rounded-md bg-slate-100 p-3 text-sm text-muted">
                      Detailed topics will be added soon.
                    </p>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted">
          Exam topics will be published soon.
        </p>
      )}
    </section>
  );
}
