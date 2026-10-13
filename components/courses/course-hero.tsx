import Image from "next/image";
import { BookOpen, FileText, Users, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { CourseSidebar } from "@/components/courses/course-sidebar";
import type { CourseAccess, CourseDetail } from "@/components/courses/course-detail-types";

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
  return (
    <section className="min-h-[70vh] bg-slate-100 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-sm text-muted">
          Home / Courses / {course.category} / {course.title}
        </p>

        <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-10">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold leading-tight text-primary lg:text-4xl">
              {course.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-5 text-xs text-foreground sm:text-sm">
              <StatItem icon={BookOpen} value={course.lessonCount} label="Lessons" />
              <StatItem icon={FileText} value={course.pdfNoteCount} label="PDF Notes" />
              <StatItem
                icon={FileText}
                value={course.totalMockTests}
                label="Model Tests"
              />
              <StatItem
                icon={Users}
                value={course.studentCount}
                label="Students"
              />
            </div>

            <div className="mt-5">{children}</div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <Image
                src={course.coverUrl ?? "/course-placeholder.svg"}
                alt={course.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
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
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon aria-hidden="true" size={15} className="text-muted" />
      <span>
        <strong className="font-medium">{value}</strong> {label}
      </span>
    </span>
  );
}
