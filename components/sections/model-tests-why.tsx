import { Clock3, FileCheck2, ListChecks } from "lucide-react";
const pillars = [
  [
    Clock3,
    "Real Exam Timing",
    "Every test runs on the actual exam clock with no pause.",
  ],
  [
    ListChecks,
    "Instant Scoring",
    "Objective questions are graded the moment you submit.",
  ],
  [
    FileCheck2,
    "Detailed Review",
    "See per-question analysis and topic-wise breakdowns.",
  ],
];
export function ModelTestsWhy() {
  return (
    <section className="bg-primary-dark px-4 py-12 text-cream sm:px-6 md:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
            Why model tests
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold lg:text-4xl">
            Practice like it&apos;s the real thing.
          </h2>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {pillars.map(([Icon, title, body]) => (
            <div
              key={String(title)}
              className="rounded-lg border border-cream/15 bg-cream/5 p-6"
            >
              <Icon className="text-accent" size={24} />
              <h3 className="mt-4 text-base font-semibold">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                {String(body)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
