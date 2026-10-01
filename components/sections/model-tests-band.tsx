import Link from "next/link";
import { ArrowUpRight, Clock, Scale, CheckCircle2, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { HomeStats } from "@/components/sections/hero";

const emptyStats = {
  mockExams: 0,
  attempts: 0,
};

export function ModelTestsBand({
  stats = emptyStats,
}: {
  stats?: Pick<HomeStats, "mockExams" | "attempts">;
}) {
  const hasStats = stats.mockExams > 0 || stats.attempts > 0;

  return (
    <section className="relative overflow-hidden bg-[#0A1428] px-6 py-16 text-cream lg:py-20">
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-32 top-1/2 h-80 w-80
          -translate-y-1/2 rounded-full bg-accent/5 blur-3xl
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-24 -top-24 h-72 w-72
          rounded-full bg-accent/10 blur-3xl
        "
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column: copy */}
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-accent/60"
            />
            Model Tests
          </p>

          <h2 className="mt-4 max-w-md font-heading text-3xl font-bold leading-tight lg:text-4xl">
            Check your preparation with{" "}
            <span className="text-accent">real exam simulations.</span>
          </h2>

          <p className="mt-5 max-w-md leading-7 text-cream/75">
            Sharpen your skills with full-length mock exams modelled on the
            Bangladeshi Judicial Service examination — with instant scoring and
            detailed written evaluation.
          </p>

          {/* Feature checklist */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/70">
            {["Timed sessions", "Instant scoring", "Written feedback"].map(
              (item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    strokeWidth={2.25}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              )
            )}
          </ul>

          <Link
            href="/model-tests"
            className="
              group mt-7 inline-flex h-11 cursor-pointer items-center
              justify-center gap-2 rounded-full border border-accent
              px-6 text-sm font-semibold text-accent transition-all
              duration-200 hover:bg-accent hover:text-primary
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-accent focus-visible:ring-offset-2
              focus-visible:ring-offset-[#0A1428]
            "
          >
            Try a Model Test
            <ArrowUpRight
              size={16}
              strokeWidth={2.25}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>

          {/* Stats */}
          {hasStats && (
            <dl className="mt-10 flex items-center gap-8 border-t border-cream/10 pt-6">
              <div>
                <dd className="font-heading text-2xl font-bold text-cream">
                  {stats.mockExams.toLocaleString()}
                </dd>
                <dt className="mt-1 text-xs text-cream/60">
                  published mock exams
                </dt>
              </div>
              <div aria-hidden="true" className="h-10 w-px bg-cream/15" />
              <div>
                <dd className="font-heading text-2xl font-bold text-cream">
                  {stats.attempts.toLocaleString()}
                </dd>
                <dt className="mt-1 text-xs text-cream/60">
                  attempts by students
                </dt>
              </div>
            </dl>
          )}
        </div>

        {/* Right column: preview card */}
        <div className="relative ml-auto w-full max-w-md">
          <Scale
            aria-hidden="true"
            size={200}
            strokeWidth={1}
            className="
              pointer-events-none absolute right-0 top-1/2 hidden
              -translate-y-1/2 text-accent opacity-[0.06] lg:block
            "
          />

          <Card
            className="
              relative z-10 ml-auto max-w-md overflow-hidden rounded-2xl
              bg-white p-5 shadow-2xl ring-1 ring-black/5
            "
          >
            {/* Card header */}
            <div className="flex items-center justify-between gap-4">
              <Badge className="border-accent/40 bg-accent/10 text-xs font-semibold text-accent">
                Preliminary
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock aria-hidden="true" size={14} />
                180 min
              </span>
            </div>

            <h3 className="mt-4 text-base font-semibold text-primary">
              Criminal Procedure Code
            </h3>
            <p className="mt-1 text-xs text-muted">
              100 questions · Full syllabus
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted">
                <span>Syllabus coverage</span>
                <span className="text-primary">100%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
                <div className="h-full w-full rounded-full bg-accent" />
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="flex items-center justify-between gap-4">
              <Link
                href="/model-tests"
                className="
                  group inline-flex h-9 cursor-pointer items-center gap-1.5
                  rounded-lg bg-primary px-4 text-xs font-semibold text-cream
                  transition-all duration-200 hover:bg-primary/90
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-primary focus-visible:ring-offset-2
                "
              >
                <Play
                  size={12}
                  strokeWidth={2.5}
                  className="fill-current"
                  aria-hidden="true"
                />
                Start Test
              </Link>
              <Link
                href="/model-tests"
                className="
                  group inline-flex min-h-9 cursor-pointer items-center
                  gap-1 text-xs font-medium text-muted transition-colors
                  hover:text-foreground focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-primary
                  focus-visible:ring-offset-2
                "
              >
                View details
                <ArrowUpRight
                  size={14}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}