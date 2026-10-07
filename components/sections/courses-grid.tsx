import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Course } from "@/lib/types/course";

export function CoursesGrid({ courses }: { courses: Course[] }) {
  return (
    <section className="bg-cream px-4 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {courses.map((course) => (
          <Link
            key={course._id.toString()}
            href={`/courses/${course.slug}`}
            className="group block cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Card className="flex h-full flex-col overflow-hidden border-border transition-shadow group-hover:shadow-md">
              {course.coverUrl ? (
                <div
                  className="aspect-[16/9] bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.coverUrl})` }}
                  role="img"
                  aria-label={course.title}
                />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-primary-dark p-5">
                  <span className="text-xs uppercase tracking-[.15em] text-accent">
                    {course.category}
                  </span>
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                <Badge className="w-fit border-accent text-accent">
                  {course.category}
                </Badge>
                <h2 className="mt-3 text-[17px] font-semibold text-primary">
                  {course.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <Badge className="gap-1 border-border text-muted">
                    <Clock aria-hidden="true" size={13} />
                    {course.durationLabel}
                  </Badge>
                  <span className="font-heading text-xl font-bold text-primary">
                    {course.price > 0
                      ? `BDT ${course.price.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  View Course
                  <ArrowRight
                    aria-hidden="true"
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          No published courses match your filters.
        </p>
      ) : null}
    </section>
  );
}
