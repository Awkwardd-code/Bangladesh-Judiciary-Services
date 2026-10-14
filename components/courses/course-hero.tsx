import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Layers3,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { CourseSidebar } from "@/components/courses/course-sidebar";
import type {
  CourseAccess,
  CourseDetail,
} from "@/components/courses/course-detail-types";

export function CourseHero({
  course,
  isLoggedIn,
  access,
  children,
}: {
  course: CourseDetail;
  isLoggedIn: boolean;
  access: CourseAccess | null;
  children: ReactNode;
}) {
  const isExamCourse = course.programKind === "exam";
  const stats = isExamCourse
    ? [
        {
          icon: ClipboardCheck,
          value: course.tests?.length ?? course.totalMockTests,
          label: "Practice tests",
        },
        {
          icon: Layers3,
          value: course.segments.length,
          label: "Test segments",
        },
        {
          icon: BookOpen,
          value: course.topics?.length ?? 0,
          label: "Exam topics",
        },
        { icon: Users, value: course.studentCount, label: "Candidates" },
      ]
    : [
        { icon: BookOpen, value: course.lessonCount, label: "Lessons" },
        { icon: FileText, value: course.pdfNoteCount, label: "PDF notes" },
        {
          icon: ClipboardCheck,
          value: course.totalMockTests,
          label: "Model tests",
        },
        {
          icon: CalendarDays,
          value: course.durationLabel,
          label: "Duration",
        },
      ];

  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-slate-50 via-cream to-amber-50/70">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:text-sm">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={isExamCourse ? "/exam-courses" : "/courses"}
                  className="hover:text-primary"
                >
                  {isExamCourse ? "Exam courses" : "Courses"}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-full truncate font-medium text-primary sm:max-w-md">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="mt-6 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-12">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-xs font-semibold text-primary">
                  {isExamCourse ? "Exam preparation" : `${course.category} program`}
                </span>
                <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-medium capitalize text-muted">
                  {course.level}
                </span>
              </div>

              <h1 className="mt-4 break-words font-heading text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {course.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
                {stats.map((stat) => (
                  <StatItem
                    key={stat.label}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                  />
                ))}
              </div>
            </div>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <Image
                  src={course.coverUrl ?? "/course-placeholder.svg"}
                  alt={`${course.title} cover`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 380px, 100vw"
                  priority
                />
              </div>
              <CourseSidebar
                course={course}
                isLoggedIn={isLoggedIn}
                access={access}
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          {children}
        </div>
      </section>
    </main>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-white/80 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
        <Icon aria-hidden="true" size={16} className="shrink-0 text-accent" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 truncate font-heading text-lg font-bold text-primary sm:text-xl">
        {value}
      </p>
    </div>
  );
}
