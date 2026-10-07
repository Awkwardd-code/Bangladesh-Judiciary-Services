import { CheckCircle2, Lock } from "lucide-react";

import type { CourseAccess } from "@/components/courses/course-detail-types";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course";

type PublicCourse = Pick<
  Course,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "longDescription"
  | "coverUrl"
  | "category"
  | "price"
  | "durationLabel"
>;

type MaterialSummary = {
  id: string;
  title: string;
  description?: string;
  kind: "pdf" | "doc" | "link";
  url?: string;
  size?: number;
  isFreePreview?: boolean;
};

export function CourseBody({
  course,
  materials,
  access,
}: {
  course: PublicCourse;
  materials: MaterialSummary[];
  access: CourseAccess | null;
}) {
  const learnPoints = [
    "Understand the syllabus and exam patterns with clarity.",
    "Build a study routine that matches real-time revision cycles.",
    "Practice with structured classes and guided content.",
    "Improve speed, accuracy, and answer framing under pressure.",
    "Track improvement through focused lesson-by-lesson progress.",
    "Prepare for long-form writing and revision with confidence.",
  ];

  return (
    <section className="bg-cream pb-16">
      <div className="max-w-prose">
        <p className="text-[17px] leading-8 text-foreground">
          {course.longDescription ?? course.description}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-primary">
          What you&apos;ll learn
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {learnPoints.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={18} />
              <p className="text-[15px] text-foreground">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Course curriculum
        </h2>

        {materials.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Curriculum will be published soon.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {materials.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <p className="text-[15px] font-medium text-primary">
                      {item.title}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="border border-border bg-transparent text-[11px] text-muted">
                        {item.kind}
                      </Badge>

                      {typeof item.size === "number" ? (
                        <span className="text-[12px] text-muted">
                          {(item.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {access?.hasAccess || (access && item.isFreePreview) ? (
                  <a
                    href={`/api/materials/${item.id}/download`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-muted">
                    <Lock size={14} />
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Who this is for
        </h2>

        <p className="mt-4 max-w-prose text-[15px] leading-7 text-foreground">
          This course is built for students who want a structured path to
          BJS preparation, a strong revision habit, and clear guidance on
          how to improve across each stage of the syllabus.
        </p>
      </div>
    </section>
  );
}
