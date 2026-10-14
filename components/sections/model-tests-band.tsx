import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

import type { CourseCategory } from "@/lib/types/course";
import { getCategoryMeta } from "@/lib/types/course";

export type PublicExamBatch = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl?: string;
  category: CourseCategory;
  price: number;
  durationLabel: string;
};

export function ModelTestsBand({ batches }: { batches: PublicExamBatch[] }) {
  return (
    <section className="relative overflow-hidden bg-primary-dark px-5 py-16 text-cream sm:px-6 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <span aria-hidden="true" className="h-px w-6 bg-accent/60" />
              Model Tests
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Find your next
              <span className="text-accent"> exam batch.</span>
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-cream/75">
              Structured model test batches with focused practice, a clear
              schedule, and exam preparation for your program.
            </p>
          </div>
          <Link
            href="/exam-courses"
            className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-accent-on-dark px-5 text-sm font-semibold text-accent-on-dark transition-colors hover:bg-accent-soft hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-fit"
          >
            Browse all model tests
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {batches.length > 0 ? (
          <div className="mt-9 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {batches.map((batch) => (
              <Link
                key={batch.id}
                href={`/courses/${batch.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-card text-primary shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-primary/5">
                  <Image
                    src={batch.coverUrl ?? "/course-placeholder.svg"}
                    alt={batch.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-card/95 px-3 py-1 text-xs font-semibold text-primary">
                    {getCategoryMeta(batch.category).shortLabel} model tests
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-snug">
                    {batch.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                    {batch.description}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Clock aria-hidden="true" size={14} />
                      {batch.durationLabel}
                    </span>
                    <span className="font-heading text-lg font-bold text-primary">
                      {batch.price > 0
                        ? `৳${batch.price.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-9 rounded-xl border border-dashed border-cream/20 bg-cream/5 p-8 text-center sm:p-10">
            <BookOpen className="mx-auto text-accent" size={30} />
            <p className="mt-3 font-medium text-cream">
              New model test batches are coming soon.
            </p>
            <p className="mt-1 text-sm text-cream/65">
              Explore all programs to find a course for your preparation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
