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
          <Card key={course._id.toString()} className="overflow-hidden">
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
            <div className="p-6">
              <Badge className="border-accent text-accent">
                {course.category}
              </Badge>
              <h2 className="mt-3 text-[17px] font-semibold text-primary">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                {course.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <Badge className="gap-1 border-border text-muted">
                  <Clock size={13} /> {course.durationLabel}
                </Badge>
                <span className="font-heading text-xl font-bold text-primary">
                  BDT {course.price.toLocaleString()}
                </span>
              </div>
              <Link
                href={`/dashboard/courses/${course.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                View Course <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
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
