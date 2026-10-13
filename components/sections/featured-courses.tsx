import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Course } from "@/lib/types/course";

export type PublicCourse = Pick<
  Course,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "coverUrl"
  | "category"
  | "price"
  | "durationLabel"
>;

export function FeaturedCourses({
  courses = [],
}: {
  courses?: PublicCourse[];
}) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Learn at your pace
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary lg:text-4xl">
              Courses to move you forward
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Build a strong foundation with structured lessons and practical
              resources.
            </p>
          </div>
          <Link
            href="/courses"
            className="group inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-primary hover:border-primary/30 hover:bg-primary/5"
          >
            View all courses{" "}
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course._id.toString()}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-primary/10">
                {course.coverUrl ? (
                  <Image
                    src={course.coverUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/40">
                    <FileText aria-hidden="true" size={36} />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge className="border-accent/20 bg-accent/10 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {course.category}
                  </Badge>
                  <span className="text-xs font-medium text-muted">
                    {course.price > 0 ? "Paid course" : "Free course"}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-primary">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Clock aria-hidden="true" size={14} />
                    {course.durationLabel}
                  </span>
                  <span className="font-heading text-lg font-bold text-primary">
                    {course.price > 0
                      ? `৳${course.price.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>

                {course.slug ? (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-4 inline-flex min-h-9 cursor-pointer items-center justify-between gap-1 text-sm font-semibold text-primary"
                  >
                    View course{" "}
                    <ArrowRight
                      size={16}
                      className="text-accent transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ) : (
                  <p className="mt-3 inline-flex min-h-9 items-center gap-1 text-sm text-accent">
                    View Course
                    <span aria-hidden="true">&rarr;</span>
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
