import { Card } from "@/components/ui/card";
import { DashboardStatsSkeleton } from "@/components/skeletons/dashboard-stats-skeleton";
import { FilterBarSkeleton } from "@/components/skeletons/filter-bar-skeleton";
import { SkButton, SkLine } from "@/components/skeletons/primitives";

type AdminTableSkeletonProps = {
  rows?: number;
  cols?: number;
  hasFilters?: boolean;
  hasStats?: boolean;
};

const cellWidths = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-3/5", "w-4/5"];

export function AdminTableSkeleton({
  rows = 8,
  cols = 6,
  hasFilters = false,
  hasStats = false,
}: AdminTableSkeletonProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {hasStats ? <DashboardStatsSkeleton /> : null}
      {hasFilters ? <FilterBarSkeleton selects={2} /> : null}
      <Card className="overflow-hidden border-border bg-card p-4 sm:p-6">
        <div
          className="grid gap-4 border-b border-border pb-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }, (_, index) => (
            <SkLine key={index} width={cellWidths[index % cellWidths.length]} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 py-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }, (_, colIndex) => (
                <SkLine
                  key={colIndex}
                  width={cellWidths[(rowIndex + colIndex) % cellWidths.length]}
                  height="h-5"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <SkLine width="w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkButton key={index} width="w-9" height="h-9" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
