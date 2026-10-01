import { CheckCircle2, X } from "lucide-react";

import type { AboutShape } from "@/lib/types/about";

export function AboutWhy({ about }: { about: AboutShape }) {
  const rows = Array.isArray(about.whyComparisonRows)
    ? about.whyComparisonRows.filter(Boolean)
    : [];

  const scatteredRows = rows.map((row) => row.scattered).filter(Boolean);
  const prepRows = rows.map((row) => row.bjsPrep).filter(Boolean);

  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {about.whyKicker || "Why students choose us"}
          </p>
          <h2 className="mt-3 mx-auto max-w-2xl font-heading text-3xl font-bold text-primary lg:text-4xl">
            {about.whyTitle ||
              "A preparation model built for consistency and outcomes."}
          </h2>
        </div>

        <div className="hidden lg:block mt-12">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-2 gap-4 border-b border-border px-6 py-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-muted">
                Scattered preparation
              </p>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-primary">
                BJS Prep
              </p>
            </div>

            {rows.length > 0 ? (
              rows.map((row, index) => (
                <div
                  key={`${row.scattered}-${index}`}
                  className="grid grid-cols-2 gap-4 border-b border-border px-6 py-4 last:border-b-0"
                >
                  <p className="text-[15px] leading-7 text-muted">
                    {row.scattered}
                  </p>
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <p className="text-[15px] leading-7 text-foreground">
                      {row.bjsPrep}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4 px-6 py-4">
                <p className="text-[15px] leading-7 text-muted">
                  Random resources and unstructured study
                </p>
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <p className="text-[15px] leading-7 text-foreground">
                    Clear strategy, guided learning, and timed mock practice
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:hidden">
          <div className="rounded-lg border border-border bg-muted/5 p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
              Scattered preparation
            </p>
            <ul className="mt-4 space-y-3">
              {scatteredRows.length > 0 ? (
                scatteredRows.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3">
                    <X size={16} className="mt-0.5 shrink-0 text-muted" />
                    <span className="text-[15px] leading-7 text-muted">
                      {item}
                    </span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-3">
                  <X size={16} className="mt-0.5 shrink-0 text-muted" />
                  <span className="text-[15px] leading-7 text-muted">
                    Random resources and unstructured study
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">
              BJS Prep
            </p>
            <ul className="mt-4 space-y-3">
              {prepRows.length > 0 ? (
                prepRows.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span className="text-[15px] leading-7 text-foreground">
                      {item}
                    </span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="text-[15px] leading-7 text-foreground">
                    Clear strategy, guided learning, and timed mock practice
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
