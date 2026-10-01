import Image from "next/image";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";

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
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header>
          <h2 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Featured courses
          </h2>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course._id.toString()}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/9] bg-primary/10">
                {course.coverUrl ? (
                  <Image
                    src={course.coverUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/40">
                    <FileText aria-hidden="true" size={36} />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-primary">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <Badge className="gap-1.5 border-border text-xs text-muted">
                    <Clock aria-hidden="true" size={12} />
                    {course.durationLabel}
                  </Badge>
                  <span className="font-heading text-lg font-bold text-primary">
                    BDT {course.price.toLocaleString()}
                  </span>
                </div>

                {course.slug ? (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
                  >
                    View Course
                    <span aria-hidden="true">&rarr;</span>
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
        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="inline-flex min-h-10 cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
          >
            Browse all courses
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
