import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, FileText, Target, Users } from "lucide-react";

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
  "Structured courses",
  "Model test batches",
  "Progress tracking",
];

function formatStat(value: number) {
  if (value >= 1000)
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k+`;
  return `${value}+`;
}

export function Hero({ stats, about }: HeroProps = {}) {
  const kicker = about?.heroKicker ?? DEFAULT_CONTENT.kicker;
  const title = about?.heroTitle ?? DEFAULT_CONTENT.title;
  const subtitle = about?.heroSubtitle ?? DEFAULT_CONTENT.subtitle;

  const statItems = stats
    ? [
        { icon: Users, label: "Students", value: formatStat(stats.students) },
        {
          icon: FileText,
          label: "Mock Exams",
          value: formatStat(stats.mockExams),
        },
        { icon: Target, label: "Attempts", value: formatStat(stats.attempts) },
      ]
    : [];

  return (
    <section className="relative isolate w-full overflow-hidden bg-primary text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-28 size-[30rem] rounded-full bg-primary-dark opacity-80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.07),transparent_35%)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid items-center gap-8 sm:grid-cols-[1.15fr_0.85fr] sm:gap-6 md:gap-10 lg:gap-12">
          <div className="flex flex-col">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-on-dark">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent"
              />
              {kicker}
            </p>

            <h1
              className="
                mt-4 max-w-3xl font-heading text-3xl font-extrabold
                leading-[1.06] tracking-tight text-cream sm:text-4xl
                lg:text-[56px] xl:text-[62px]
              "
            >
              {title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-cream/70 sm:text-lg sm:leading-7">
              {subtitle}
            </p>

            <ul className="mt-4 hidden flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-cream/65 sm:flex sm:text-[13px]">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={13} className="text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/courses"
                className="
                  group inline-flex w-full cursor-pointer items-center
                  justify-center gap-2 rounded-full bg-accent-soft px-6 py-3.5
                  text-sm font-bold text-primary-dark transition-all
                  duration-200 hover:-translate-y-0.5 hover:bg-accent-soft/90
                  hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-none
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
                href="/exam-courses"
                className="
                  group inline-flex w-full cursor-pointer items-center
                  justify-center gap-2 rounded-full border border-cream/20
                  bg-cream/[0.04] px-6 py-3.5 text-sm font-semibold text-cream
                  transition-all duration-200 hover:border-cream/40
                  hover:bg-cream/10 focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-accent
                  focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                  sm:w-auto
                "
              >
                Browse Model Tests
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {statItems.length > 0 && (
              <dl className="mt-6 grid max-w-xl grid-cols-3 divide-x divide-cream/15 rounded-xl border border-cream/10 bg-cream/[0.04] py-3">
                {statItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 px-2 sm:items-start sm:px-5"
                  >
                    <dt className="sr-only">{label}</dt>
                    <dd className="flex items-center gap-2 font-heading text-lg font-bold text-cream sm:text-xl">
                      <Icon
                        size={17}
                        strokeWidth={2}
                        className="hidden text-accent sm:block"
                        aria-hidden="true"
                      />
                      {value}
                    </dd>
                    <span className="text-center text-[9px] font-medium uppercase tracking-wider text-cream/50 sm:text-left">
                      {label}
                    </span>
                  </div>
                ))}
              </dl>
            )}

          </div>

          <div
            className="
              mx-auto w-full sm:max-w-[320px]
              md:ml-auto md:max-w-[380px] lg:max-w-[420px]
            "
          >
            <div className="relative px-2 pb-2">
              <div
                aria-hidden="true"
                className="
                  absolute inset-x-0 bottom-0 top-6 rounded-[1.75rem]
                  border border-cream/10 bg-gradient-to-br from-cream/10
                  to-transparent
                "
              />
              <div className="relative aspect-[2.2/1] w-full overflow-hidden rounded-[1.5rem] bg-primary-dark shadow-2xl shadow-black/25 ring-1 ring-cream/15 sm:aspect-[1.16/1]">
                <Image
                  src="/mentor.jpeg"
                  alt="Mentor in formal attire"
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover object-[50%_10%]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-primary/75 p-3 text-cream shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
                    Prepare with purpose
                  </p>
                  <p className="mt-1 font-heading text-base font-semibold sm:text-lg">
                    A clearer path to your legal career
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
