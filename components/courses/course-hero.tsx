import Image from "next/image";
import {
  Clock,
  FileText,
  FolderOpen,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  CourseDetail,
  CourseMentor,
} from "@/components/courses/course-detail-types";

export function CourseHero({
  course,
  mentors,
}: {
  course: CourseDetail;
  mentors: CourseMentor[];
}) {
  return (
    <section className="bg-cream pb-8 pt-16 lg:pb-10 lg:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm text-muted">
          Home / Courses / {course.category} / {course.title}
        </p>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <Badge className="border-accent text-xs uppercase text-accent">
              {course.category}
            </Badge>

            <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-primary lg:text-5xl">
              {course.title}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              {course.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-border text-muted">{course.level}</Badge>
              {course.tags.map((tag) => (
                <Badge key={tag} className="border-border text-muted">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <StatPill icon={Clock} label={course.durationLabel} />
              <StatPill
                icon={Video}
                label={`${course.totalClasses} classes`}
              />
              <StatPill
                icon={FileText}
                label={`${course.totalMockTests} model tests`}
              />
              <StatPill
                icon={FolderOpen}
                label={`${course.totalMaterials} materials`}
              />
            </div>

            {mentors.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-medium text-muted">Led by</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex -space-x-2">
                    {mentors.slice(0, 4).map((mentor) => (
                      <span
                        key={mentor.id}
                        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-cream bg-primary/10 text-xs font-semibold text-primary"
                      >
                        {mentor.photoUrl ? (
                          <Image
                            src={mentor.photoUrl}
                            alt={mentor.name}
                            fill
                            unoptimized
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          mentor.name.slice(0, 1)
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground">
                    {mentors
                      .slice(0, 3)
                      .map((mentor) => mentor.name)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-primary/10 shadow-md">
            <Image
              src={course.coverUrl ?? "/course-placeholder.svg"}
              alt={course.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground">
      <Icon aria-hidden="true" size={16} className="text-accent" />
      {label}
    </span>
  );
}
