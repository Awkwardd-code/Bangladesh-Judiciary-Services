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

const DEFAULT_FEATURES = [
  { label: "Lifetime access", value: "Included", iconName: "BookOpen" },
  { label: "Mentor support", value: "Included", iconName: "Users" },
  { label: "Downloadable notes", value: "Included", iconName: "Download" },
  { label: "Model tests", value: "Included", iconName: "FileText" },
  { label: "Written evaluation", value: "Included", iconName: "ClipboardCheck" },
  { label: "Performance analytics", value: "Included", iconName: "BarChart3" },
];

export function CourseWhatIncluded({ course }: { course: CourseDetail }) {
  const features =
    course.features.length > 0 ? course.features : DEFAULT_FEATURES;

  return (
    <section className="bg-cream py-8">
      <h2 className="font-heading text-2xl font-bold text-primary">
        What&apos;s included
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = ICON_MAP[feature.iconName] ?? CheckCircle2;

          return (
            <Card
              key={`${feature.label}-${index}`}
              className="flex items-start gap-4 border-border p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-accent">
                <Icon aria-hidden="true" size={20} />
              </span>

              <div>
                <p className="font-heading text-lg font-bold text-primary">
                  {feature.value}
                </p>
                <p className="mt-1 text-[13px] text-muted">{feature.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
