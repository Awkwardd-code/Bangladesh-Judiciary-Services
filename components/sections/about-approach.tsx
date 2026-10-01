import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Compass,
  FileText,
  MessageSquare,
  Scale,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AboutShape } from "@/lib/types/about";

const ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "file-text": FileText,
  "clipboard-check": ClipboardCheck,
  users: Users,
  scale: Scale,
  target: Target,
  compass: Compass,
  "bar-chart-3": BarChart3,
  "message-square": MessageSquare,
};

export function AboutApproach({ about }: { about: AboutShape }) {
  const pillars = Array.isArray(about.approachPillars)
    ? about.approachPillars.filter(Boolean)
    : [];

  return (
    <section className="bg-primary px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {about.approachKicker || "How we work"}
          </p>
          <h2 className="mt-3 mx-auto max-w-2xl font-heading text-3xl font-bold text-cream lg:text-4xl">
            {about.approachTitle ||
              "We turn preparation into a measurable process."}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.length > 0 ? (
            pillars.map((pillar, index) => {
              const Icon = ICON_MAP[String(pillar.iconName || "book-open").toLowerCase()] ?? BookOpen;

              return (
                <div
                  key={`${pillar.title}-${index}`}
                  className="rounded-lg border border-cream/10 bg-cream/[0.03] p-6"
                >
                  <Icon size={22} className="text-accent" />
                  <h3 className="mt-4 text-[16px] font-semibold text-cream">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-cream/70">
                    {pillar.description}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-cream/10 bg-cream/[0.03] p-6 md:col-span-2 lg:col-span-4">
              <BookOpen size={22} className="text-accent" />
              <h3 className="mt-4 text-[16px] font-semibold text-cream">
                Structured learning
              </h3>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Every topic is mapped to a disciplined preparation flow so students know what to cover, in what order, and why it matters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
