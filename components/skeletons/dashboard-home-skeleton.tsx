import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

function ChartCard({ height = "h-[300px]" }: { height?: string }) {
  return (
    <Card className="space-y-5 border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <SkTitle width="w-40" />
        <SkButton width="w-20" />
      </div>
      <SkSquare className="w-full" size={height} />
    </Card>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkTitle width="w-72" height="h-8" />
          <SkLine width="w-64" />
        </div>
        <SkLine width="w-44" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-4 border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <SkLine width="w-28" />
              <SkSquare />
            </div>
            <SkTitle width="w-24" height="h-8" />
            <SkLine width="w-32" />
          </Card>
        ))}
      </section>
      <ChartCard />
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard height="h-[260px]" />
        <ChartCard height="h-[260px]" />
      </section>
      <ChartCard height="h-[260px]" />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="flex items-center gap-3 p-4">
            <SkSquare />
            <SkLine width="w-32" />
          </Card>
        ))}
      </section>
      <Card className="border-border bg-card p-5 sm:p-6">
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
      </Card>
    </div>
  );
}
