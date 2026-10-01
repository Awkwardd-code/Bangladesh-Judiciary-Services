import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users, FileText, Target } from "lucide-react";

import type { About } from "@/lib/types/about";

export type HomeStats = {
  students: number;
  mockExams: number;
  attempts: number;
};

type HeroProps = {
  stats?: HomeStats;
  about?: Pick<About, "heroKicker" | "heroTitle" | "heroSubtitle"> | null;
};

const DEFAULT_CONTENT = {
  kicker: "Begin Your Journey",
  title: "Be a Judge or Lawyer",
  subtitle: "From Campus to Court, Win Everywhere",
};

const HIGHLIGHTS = [
  "Mentor-led",
  "Model Tests",
  "Written Evaluation",
  "Lifetime Access",
];

function formatStat(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k+`;
  return `${value}+`;
}

export function Hero({ stats, about }: HeroProps = {}) {
  const kicker = about?.heroKicker ?? DEFAULT_CONTENT.kicker;
  const title = about?.heroTitle ?? DEFAULT_CONTENT.title;
  const subtitle = about?.heroSubtitle ?? DEFAULT_CONTENT.subtitle;

  const statItems = stats
    ? [
        { icon: Users, label: "Students", value: formatStat(stats.students) },
        { icon: FileText, label: "Mock Exams", value: formatStat(stats.mockExams) },
        { icon: Target, label: "Attempts", value: formatStat(stats.attempts) },
      ]
    : [];

  return (
    <section className="relative w-full overflow-hidden bg-primary">
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-32 -left-32 h-96 w-96
          rounded-full bg-[#0F1B33] opacity-60 blur-3xl
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-24 -top-24 h-80 w-80
          rounded-full bg-accent/10 opacity-60 blur-3xl
        "
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: content */}
          <div className="order-2 flex flex-col lg:order-1 lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-accent">
              {kicker}
            </p>

            <h1
              className="
                mt-4 font-heading text-4xl font-extrabold leading-[1.05]
                tracking-tight text-cream sm:text-5xl lg:text-6xl
                xl:text-[64px]
              "
            >
              {title}
            </h1>

            <p className="mt-5 max-w-lg text-base text-cream/75 sm:text-lg">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link
                href="/courses"
                className="
                  group inline-flex w-full cursor-pointer items-center
                  justify-center gap-2 rounded-full bg-cream px-6 py-3
                  text-sm font-semibold text-primary transition-all
                  duration-200 hover:bg-cream/90 hover:shadow-lg
                  hover:shadow-cream/20 focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-accent
                  focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                  sm:w-auto
                "
              >
                Start Learning
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                href="/model-tests"
                className="
                  group inline-flex w-full cursor-pointer items-center
                  justify-center gap-2 rounded-full border border-cream/40
                  px-6 py-3 text-sm font-semibold text-cream
                  transition-all duration-200 hover:border-cream/60
                  hover:bg-cream/10 focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-accent
                  focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                  sm:w-auto
                "
              >
                Take a Model Test
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Stats (conditional) */}
            {statItems.length > 0 && (
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
                {statItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className="text-accent"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-heading text-2xl font-bold text-cream">
                      {value}
                    </dd>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-cream/50">
                      {label}
                    </span>
                  </div>
                ))}
              </dl>
            )}

            {/* Highlights */}
            <ul className="mt-10 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13px] text-cream/60 sm:mt-12">
              {HIGHLIGHTS.map((item, i) => (
                <li key={item} className="flex items-center">
                  {i > 0 && (
                    <span aria-hidden="true" className="px-3 text-accent">
                      ·
                    </span>
                  )}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: image */}
          <div
            className="
              order-1 mx-auto w-full max-w-[320px] sm:max-w-[360px]
              lg:order-2 lg:col-span-5 lg:ml-auto lg:max-w-[420px]
            "
          >
            <div className="relative">
              {/* Decorative frame behind image */}
              <div
                aria-hidden="true"
                className="
                  absolute -inset-3 rounded-3xl border border-cream/10
                  bg-gradient-to-br from-cream/5 to-transparent
                "
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1 ring-cream/10">
                {/* NOTE: Place the portrait at public/images/hero-mentor.jpg. */}
                <Image
                  src="/mentor.jpg"
                  alt="Mentor in formal attire"
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
                {/* Subtle gradient overlay for depth */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none absolute inset-0
                    bg-gradient-to-t from-primary/40 via-transparent to-transparent
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}