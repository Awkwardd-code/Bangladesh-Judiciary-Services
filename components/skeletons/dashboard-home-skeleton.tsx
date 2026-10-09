import {
  SkBadge,
  SkHeading,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

function ChartCard({
  height = "h-[300px]",
  titleWidth = "w-40",
  titleAside,
  chartMargin = "mt-3",
}: {
  height?: string;
  titleWidth?: string;
  titleAside?: boolean;
  chartMargin?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
      {titleAside ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <SkTitle width={titleWidth} />
          <SkLine width="w-16" />
        </div>
      ) : (
        <SkTitle width={titleWidth} />
      )}
      <SkSquare className={`w-full ${chartMargin}`} size={height} />
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkHeading width="w-72" height="h-8" />
          <SkLine width="w-64" />
        </div>
        <SkLine width="w-44" />
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Platform statistics"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <article
            key={index}
            className="
              relative overflow-hidden rounded-lg border border-border
              bg-card p-5
            "
          >
            <SkLine
              width="w-14"
              height="h-1"
              className="absolute left-0 top-0"
            />
            <div className="flex items-center justify-between">
              <SkLine width="w-24" />
              <SkSquare size="w-5 h-5" />
            </div>
            <SkTitle width="w-16" height="h-8" className="mt-4" />
            <SkLine width="w-20" className="mt-2" />
          </article>
        ))}
      </section>

      <ChartCard
        height="h-[260px]"
        titleWidth="w-48"
        titleAside
        chartMargin=""
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard height="h-[250px]" titleWidth="w-44" />
        <ChartCard height="h-[250px]" titleWidth="w-40" />
      </section>

      <ChartCard height="h-[280px]" titleWidth="w-44" chartMargin="mt-5" />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="
              flex min-h-20 items-center gap-3 rounded-lg border border-border
              bg-card p-5
            "
          >
            <SkSquare size="w-5 h-5" />
            <SkLine width="w-32" height="h-4" />
          </div>
        ))}
      </section>
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <SkTitle width="w-40" />
          <SkLine width="w-20" />
        </div>
        <div className="mt-4 divide-y divide-border">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex-1 space-y-2">
                <SkLine width="w-1/2" />
                <SkLine width="w-32" />
              </div>
              <SkBadge width="w-16" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
