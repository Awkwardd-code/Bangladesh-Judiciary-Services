"use client";

import type { AboutShape } from "@/lib/types/about";

export function AboutPreviewPanel({ form }: { form: AboutShape }) {
  const stats = form.stats.slice(0, 4);

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Live preview
        </p>
      </div>

      <div className="overflow-hidden">
        <section className="bg-cream px-5 py-10 text-center">
          <div className="mx-auto max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              {form.heroKicker}
            </p>
            <h2 className="mx-auto mt-3 max-w-lg font-heading text-2xl font-bold leading-tight text-primary">
              {form.heroTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">
              {form.heroSubtitle}
            </p>

            {stats.length > 0 ? (
              <div className="mt-8 flex flex-wrap justify-center gap-6">
                {stats.map((stat, index) => (
                  <div key={`${stat.label}-${index}`}>
                    <p className="font-heading text-xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-t border-border bg-cream px-5 py-8">
          <div className="grid gap-6 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                {form.missionKicker}
              </p>
              <h3 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">
                {form.missionTitle}
              </h3>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-3">
              {form.missionParagraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph.slice(0, 20)}-${index}`}
                  className="text-xs leading-6 text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
