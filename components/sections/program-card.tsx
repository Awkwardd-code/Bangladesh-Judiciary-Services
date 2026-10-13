import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Landmark,
  Lightbulb,
  ListChecks,
  Megaphone,
  Scale,
  Star,
  TrendingUp,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { type ProgramMeta } from "@/lib/program-meta";

const programIcons = {
  BJS: Scale,
  BAR: Landmark,
  LLB: GraduationCap,
} satisfies Record<ProgramMeta["code"], LucideIcon>;

const featureIcons: Record<string, LucideIcon> = {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Download,
  FileText,
  FolderOpen,
  Lightbulb,
  ListChecks,
  Megaphone,
  Star,
  TrendingUp,
  Trophy,
  Video,
};

export function ProgramCard({
  program,
  ctaHref,
  variant = "page",
}: {
  program: ProgramMeta;
  ctaHref?: string;
  variant?: "page" | "strip";
}) {
  const ProgramIcon = programIcons[program.code];
  const isStrip = variant === "strip";

  return (
    <Card
      className={`
        grid overflow-hidden rounded-xl border border-border bg-card
        shadow-sm lg:grid-cols-12
        ${isStrip ? "p-0" : "p-0"}
      `}
    >
      <div
        className={
          isStrip ? "p-6 lg:col-span-7 lg:p-8" : "p-8 lg:col-span-7 lg:p-10"
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-cream">
            <ProgramIcon size={24} />
          </div>
          <div className="min-w-0">
            <span className="inline-block rounded-full border border-border px-3 py-0.5 text-[11px] uppercase tracking-[0.12em] text-muted">
              {program.agencyBadge}
            </span>
            <h3
              className={
                isStrip
                  ? "mt-2 font-heading text-2xl font-bold text-primary"
                  : "mt-2 font-heading text-2xl font-bold text-primary lg:text-3xl"
              }
            >
              {program.name}
            </h3>
          </div>
        </div>

        <p
          className={
            isStrip
              ? "mt-4 text-[15px] leading-7 text-muted"
              : "mt-4 text-[15px] leading-7 text-muted"
          }
        >
          {program.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {program.features.map((feature) => {
            const Icon = featureIcons[feature.icon] ?? BookOpen;

            return (
              <div
                key={`${program.code}-${feature.label}`}
                className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2"
              >
                <Icon
                  aria-hidden="true"
                  className="shrink-0 text-accent-on-dark"
                  size={14}
                />
                <span className="truncate text-[13px] text-foreground">
                  {feature.label}
                </span>
              </div>
            );
          })}
        </div>

        <Link
          href={ctaHref ?? `/programs?code=${program.code}`}
          className={
            isStrip
              ? "mt-8 inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-accent-soft px-5 font-medium text-primary-dark transition-colors hover:bg-accent-soft/90"
              : "mt-8 inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-accent-soft px-6 font-medium text-primary-dark transition-colors hover:bg-accent-soft/90"
          }
        >
          {program.ctaLabel}
          <ArrowRight size={16} />
        </Link>
      </div>

      <aside className="bg-primary p-8 text-cream lg:col-span-5 lg:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-on-dark">
          YOUR JOURNEY
        </p>
        <ol className="relative mt-6">
          {program.journey.map((step, index) => {
            const isFirst = index === 0;
            const isLast = index === program.journey.length - 1;

            return (
              <li
                key={`${program.code}-journey-${step.number}`}
                className="relative flex items-start gap-4 pb-8 last:pb-0"
              >
                <span className="flex flex-col items-center self-stretch">
                  <span
                    className={`
                      flex h-7 w-7 shrink-0 items-center justify-center
                      rounded-full border-2 text-xs font-semibold
                      ${
                        isFirst
                          ? "border-accent-soft bg-accent-soft text-primary-dark"
                          : "border-cream/30 text-cream/70"
                      }
                    `}
                  >
                    {step.number}
                  </span>
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="mt-2 w-px flex-1 bg-cream/20"
                    />
                  ) : null}
                </span>
                <span className="pt-0.5 font-heading text-base font-semibold text-cream">
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>
    </Card>
  );
}
