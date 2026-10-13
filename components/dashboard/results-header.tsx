import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

export function ResultsHeader() {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-7 shadow-sm sm:px-8">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <ClipboardCheck size={15} aria-hidden="true" />
            Your progress
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-primary lg:text-4xl">
            Exam results
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Review your performance and keep building momentum.
          </p>
        </div>
        <Link
          href="/dashboard/exams"
          className="group inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-cream shadow-sm hover:bg-primary/90"
        >
          Take a new test
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
