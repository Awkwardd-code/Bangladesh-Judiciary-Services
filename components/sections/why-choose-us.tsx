import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  FileText,
  MessageSquare,
  Scale,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const pillars = [
  {
    icon: Compass,
    title: "Guided Path",
    description: "Learn how to navigate skills and guided path.",
  },
  {
    icon: MessageSquare,
    title: "Clear Language",
    description: "Clear language is simpler for legal topics.",
  },
  {
    icon: Scale,
    title: "Legal Logic",
    description: "Reason through every provision, not just memorise it.",
  },
  {
    icon: FileText,
    title: "Preparation",
    description: "Current level exam aligned to structured practice tests.",
  },
  {
    icon: BookOpen,
    title: "Story Telling",
    description: "Stories make law stay in the story and help retention.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Focus",
    description: "Data-driven focus with everything from Real-time focus.",
  },
  {
    icon: CheckCircle2,
    title: "Exam Ready",
    description: "Exam ready focus are Jucial Service exam.",
  },
  {
    icon: CheckCircle2,
    title: "Exam Ready",
    description: "Complete one exam-quality Jucial Service exam.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h2 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Why choose BJS Prep
          </h2>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <Card
                key={`${pillar.title}-${index}`}
                className="relative flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-0 h-0.5 w-8 rounded-b bg-accent"
                />
                <Icon aria-hidden="true" size={20} className="text-primary" />
                <h3 className="text-[15px] font-semibold text-primary">
                  {pillar.title}
                </h3>
                <p className="line-clamp-2 text-[13px] leading-5 text-muted">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
