import Link from "next/link";
import { ArrowRight, ClipboardCheck, Sparkles } from "lucide-react";

export function ResultsHeader() {
  return (
    <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-border/80 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <ClipboardCheck size={14} aria-hidden="true" />
            Learning analytics
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Exam results
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
            Every attempt is a chance to learn. Review your answers, track your
            progress, and decide what to practice next.
          </p>
        </div>
        <Link
          href="/dashboard/exams"
          className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-primary/90 sm:w-fit"
        >
          <Sparkles size={15} aria-hidden="true" />
          Practice again
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
