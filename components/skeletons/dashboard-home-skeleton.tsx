import {
  SkBadge,
  SkHeading,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function DashboardHomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-2xl bg-primary px-6 py-7 sm:px-8">
        <SkBadge width="w-36" />
        <SkHeading width="w-72" height="h-8" className="mt-3" />
        <SkLine width="w-80" className="mt-3" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <article
            key={index}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <SkLine width="w-28" />
              <SkSquare size="w-5 h-5" />
            </div>
            <SkTitle width="w-20" height="h-8" className="mt-4" />
            <SkLine width="w-32" className="mt-2" />
          </article>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-4"
          >
            <SkSquare size="w-5 h-5" />
            <SkLine width="w-32" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <SkTitle width="w-36" />
          <SkLine width="w-52" className="mt-2" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-border p-3"
              >
                <SkSquare size="w-full aspect-video" />
                <SkLine width="w-24" className="mt-3" />
                <SkTitle width="w-40" className="mt-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <SkTitle width="w-44" />
          <SkLine width="w-48" className="mt-2" />
          <div className="mt-4 divide-y divide-border">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex-1 space-y-2">
                  <SkLine width="w-3/4" />
                  <SkLine width="w-24" />
                </div>
                <SkBadge width="w-14" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <SkTitle width="w-36" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <SkLine width="w-36" />
              <SkLine width="w-full" className="mt-3" />
              <SkLine width="w-2/3" className="mt-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
