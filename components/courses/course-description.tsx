import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Layers3,
  Users,
} from "lucide-react";

import { CourseWhatIncluded } from "@/components/courses/course-what-included";
import type { CourseDetail } from "@/components/courses/course-detail-types";

export function CourseDescription({ course }: { course: CourseDetail }) {
  const isExamCourse = course.programKind === "exam";
  const description = course.longDescription.trim() || course.description.trim();
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const focusAreas = isExamCourse
    ? (course.topics ?? []).map((topic) => topic.title)
    : course.tags;
  const overviewItems = isExamCourse
    ? [
        { label: "Program", value: course.category, icon: BookOpen },
        { label: "Difficulty", value: course.level, icon: Layers3 },
        { label: "Duration", value: course.durationLabel, icon: CalendarDays },
        {
          label: "Exam topics",
          value: String(course.topics?.length ?? 0),
          icon: FileText,
        },
        {
          label: "Test segments",
          value: String(course.segments.length),
          icon: Layers3,
        },
        {
          label: "Practice tests",
          value: String(course.tests?.length ?? course.totalMockTests),
          icon: ClipboardCheck,
        },
        {
          label: "Candidates",
          value: String(course.studentCount),
          icon: Users,
        },
      ]
    : [
        { label: "Program", value: course.category, icon: BookOpen },
        { label: "Difficulty", value: course.level, icon: Layers3 },
        { label: "Duration", value: course.durationLabel, icon: CalendarDays },
        {
          label: "Live classes",
          value: String(course.totalClasses),
          icon: Users,
        },
        {
          label: "Lessons",
          value: String(course.lessonCount),
          icon: BookOpen,
        },
        {
          label: "PDF notes",
          value: String(course.pdfNoteCount),
          icon: FileText,
        },
        {
          label: "Model tests",
          value: String(course.totalMockTests),
          icon: ClipboardCheck,
        },
      ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)] lg:gap-6">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {isExamCourse ? "Exam overview" : "Course overview"}
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-primary sm:text-3xl">
            About this {isExamCourse ? "exam course" : "course"}
          </h2>
          {paragraphs.length > 0 ? (
            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph.slice(0, 24)}`}
                  className="break-words text-sm leading-7 text-foreground sm:text-base sm:leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-7 text-muted">
              A detailed overview of this {isExamCourse ? "exam course" : "course"}{" "}
              will be published soon.
            </p>
          )}
        </section>

        <section
          aria-labelledby="course-overview-facts"
          className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <h3
            id="course-overview-facts"
            className="font-heading text-lg font-bold text-primary"
          >
            {isExamCourse ? "Exam at a glance" : "Course at a glance"}
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {overviewItems.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-border/80 bg-cream/60 p-3"
              >
                <dt className="flex items-center gap-1.5 text-[11px] leading-4 text-muted sm:text-xs">
                  <Icon
                    aria-hidden="true"
                    size={14}
                    className="shrink-0 text-accent"
                  />
                  <span className="truncate">{label}</span>
                </dt>
                <dd className="mt-2 truncate text-sm font-semibold capitalize text-primary sm:text-base">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {focusAreas.length > 0 ? (
        <section
          aria-labelledby="course-focus-areas"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h3
            id="course-focus-areas"
            className="font-heading text-lg font-bold text-primary"
          >
            {isExamCourse ? "Topics covered" : "Areas of focus"}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-primary/10 bg-primary/[0.04] px-3 py-1.5 text-xs font-medium text-primary sm:text-sm"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isExamCourse ? <CourseWhatIncluded course={course} /> : null}
    </div>
  );
}
