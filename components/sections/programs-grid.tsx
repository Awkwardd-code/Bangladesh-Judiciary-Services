import Link from "next/link";
import { BookOpen, Gavel, GraduationCap, Scale } from "lucide-react";

import type { CategorySummary } from "@/lib/category-query";
import { cn } from "@/lib/utils";

const iconMap = {
  BJS: Scale,
  BAR: Gavel,
  LLB: GraduationCap,
};

export function ProgramsGrid({ summaries }: { summaries: CategorySummary[] }) {
  return (
    <section className="bg-cream px-6 py-12 pb-20">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {summaries.map((summary) => {
          const Icon = iconMap[summary.code] ?? BookOpen;

          return (
            <div
              key={summary.code}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/5 text-primary">
                  <Icon aria-hidden="true" size={24} />
                </div>
                <span className="rounded-full border border-border bg-muted/5 px-2 py-1 text-[11px] font-medium text-muted">
                  {summary.totalCourses} courses
                </span>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold text-primary">
                  {summary.label}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {summary.description}
                </p>
              </div>

              <div className="my-2 border-t border-border" />

              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary",
                  )}
                >
                  {summary.paidCourses} paid
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  {summary.freeCourses} free
                </span>
              </div>

              <div className="mt-auto pt-2">
                <Link
                  href={`/programs/${summary.code}`}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  Explore {summary.shortLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
