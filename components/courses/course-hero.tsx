import { BookOpen, Clock, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course";

type PublicCourse = Pick<
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

export type AccessInfo = {
  hasAccess: boolean;
  reason: "free" | "approved" | "pending" | "rejected" | "none";
};

export function CourseHero({
  course,
  access,
}: {
  course: PublicCourse;
  access: AccessInfo | null;
}) {
  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-sm text-muted">
          Home / Courses / {course.category} / {course.title}
        </div>

        <div className="mt-4">
          <Badge className="border border-border bg-transparent text-accent">
            {course.category}
          </Badge>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-5xl">
          {course.title}
        </h1>

        <p className="mt-4 max-w-3xl text-[18px] text-muted">
          {course.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            <span>12 lessons</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent" />
            <span>{course.durationLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent" />
            <span>500+ enrolled</span>
          </div>

          <div className="flex items-center gap-2">
            <Star size={16} className="text-accent" />
            <span>4.9 rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
