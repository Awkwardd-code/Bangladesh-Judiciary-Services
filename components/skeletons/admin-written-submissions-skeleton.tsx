import { Card } from "@/components/ui/card";
import { FilterBarSkeleton } from "@/components/skeletons/filter-bar-skeleton";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

const columnWidths = ["w-32", "w-40", "w-20", "w-16", "w-16", "w-20"];

export function AdminWrittenSubmissionsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="space-y-3">
        <SkHeading width="w-56" height="h-8" />
        <SkLine width="w-80" height="h-4" />
      </header>

      <div className="mt-6">
        <FilterBarSkeleton selects={3} hasClear />
      </div>

      <Card className="mt-5 overflow-hidden border-border bg-card">
        <div className="hidden grid-cols-6 gap-4 border-b border-border px-5 py-3 md:grid">
          {columnWidths.map((width, index) => (
            <SkLine key={index} width={width} height="h-4" />
          ))}
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="
                grid grid-cols-1 gap-3 p-4 md:grid-cols-6 md:items-center
                md:gap-4 md:px-5
              "
            >
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                  <SkCircle size="w-8 h-8" />
                  <SkLine width="w-32" height="h-4" />
                </div>
                <SkLine width="w-40" height="h-3" className="ml-11" />
              </div>
              <SkLine width="w-40" height="h-3" />
              <SkLine width="w-20" height="h-3" />
              <SkBadge width="w-20" height="h-5" />
              <SkTitle width="w-12" height="h-5" />
              <div className="flex md:justify-end">
                <SkButton width="w-20" height="h-8" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-2">
        <SkButton width="w-24" height="h-10" />
        {Array.from({ length: 3 }, (_, index) => (
          <SkButton key={index} width="w-9" height="h-9" />
        ))}
        <SkButton width="w-24" height="h-10" />
      </div>
    </div>
  );
}
