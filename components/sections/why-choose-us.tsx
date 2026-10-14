import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  Scale,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const pillars = [
  {
    icon: BookOpen,
    title: "Structured learning",
    description:
      "Follow organized lessons that break complex legal subjects into manageable steps.",
  },
  {
    icon: FileText,
    title: "Exam-focused resources",
    description:
      "Study with course materials and class notes prepared for your learning path.",
  },
  {
    icon: Scale,
    title: "Understand the law",
    description:
      "Build legal reasoning and subject knowledge instead of relying on memorization alone.",
  },
  {
    icon: ClipboardCheck,
    title: "Practice with purpose",
    description:
      "Prepare with model test batches and exam practice aligned to your goals.",
  },
  {
    icon: Award,
    title: "Learn from feedback",
    description:
      "Review your results and identify the areas that deserve more attention.",
  },
  {
    icon: BarChart3,
    title: "Track your progress",
    description:
      "Keep your courses, tests, and results together in one learning dashboard.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-cream px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-6 bg-accent/70" aria-hidden="true" />
            Built around your goals
            <span className="h-px w-6 bg-accent/70" aria-hidden="true" />
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary lg:text-4xl">
            Preparation that keeps you moving
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
            Bring your study plan, practice, and progress together in one place.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <Card
                key={pillar.title}
                className="group relative flex min-h-36 gap-4 overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg sm:p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-primary group-hover:text-cream">
                  <Icon aria-hidden="true" size={20} />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">
                    {pillar.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
