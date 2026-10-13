import type { CategoryMeta } from "@/lib/types/course";

export function CategoryHero({ meta }: { meta: CategoryMeta }) {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-sm text-muted">
          Home / Programs / {meta.label}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {meta.shortLabel}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-5xl">
              {meta.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {meta.heroSubtitle}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-base font-semibold text-primary">
                About this program
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {meta.longDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
