import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Layers,
  Scale,
  Target,
  Trophy,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { CourseDetail } from "@/components/courses/course-detail-types";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  FileText,
  Video,
  Users,
  Clock,
  Trophy,
  Target,
  Download,
  ClipboardCheck,
  BarChart3,
  Scale,
  Layers,
};

export function CourseWhatIncluded({ course }: { course: CourseDetail }) {
  const features = course.features;

  if (features.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="font-heading text-xl font-bold text-primary">
        What&apos;s included
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = ICON_MAP[feature.iconName] ?? CheckCircle2;

          return (
            <Card
              key={`${feature.label}-${index}`}
              className="flex items-start gap-3 border-border p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-accent">
                <Icon aria-hidden="true" size={18} />
              </span>

              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-primary">
                  {feature.value}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-muted">
                  {feature.label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
