import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, GraduationCap, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCategoryMeta, type Course } from "@/lib/types/course";
import type { CourseAccess } from "@/components/courses/course-detail-types";

export function CoursesCardGrid({
  courses,
  accessByCourse = {},
}: {
  courses: Course[];
  accessByCourse?: Record<string, CourseAccess>;
}) {
  return (
    <section className="bg-cream px-4 py-8 sm:px-6 lg:py-12">
      {courses.length === 0 ? (
        <p className="mx-auto max-w-6xl rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
          No published courses match your filters.
        </p>
      ) : (
        <div className="mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const id = course._id.toString();
            const access = accessByCourse[id];
            const categoryMeta = getCategoryMeta(course.category);

            return (
              <Link
                key={id}
                href={`/courses/${course.slug}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Card className="flex h-full flex-col overflow-hidden border-border transition-shadow group-hover:shadow-lg">
                  <div className="relative aspect-[16/10] overflow-hidden bg-primary/5">
                    <Image
                      src={course.coverUrl ?? "/course-placeholder.svg"}
                      alt={course.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <Badge className="absolute left-4 top-4 border-white/70 bg-card/95 text-primary">
                      {course.programKind === "exam"
                        ? "Exam Course"
                        : categoryMeta.label}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-lg font-bold text-primary">
                      {course.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {course.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge className="gap-1 border-border text-muted">
                        <Clock aria-hidden="true" size={13} />
                        {course.durationLabel}
                      </Badge>
                      <Badge className="gap-1 border-border text-muted">
                        <GraduationCap aria-hidden="true" size={13} />
                        {course.programKind === "exam"
                          ? "Preliminary and written tests"
                          : `${course.totalClasses} classes`}
                      </Badge>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-5">
                      <span className="font-heading text-xl font-bold text-primary">
                        {course.price > 0
                          ? `BDT ${course.price.toLocaleString()}`
                          : "Free"}
                      </span>
                      {access?.reason === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <LockKeyhole size={13} />
                          Pending
                        </span>
                      ) : access?.hasAccess ? (
                        <span className="text-xs font-semibold text-emerald-700">
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                          View course
                          <ArrowRight
                            aria-hidden="true"
                            size={15}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
