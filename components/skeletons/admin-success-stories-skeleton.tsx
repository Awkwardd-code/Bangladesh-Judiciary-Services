import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkLine,
} from "@/components/skeletons/primitives";

const columnWidths = [
  "w-3/4",
  "w-2/3",
  "w-5/6",
  "w-2/3",
  "w-1/2",
  "w-2/3",
  "w-10",
];

export function AdminSuccessStoriesSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <SkLine width="w-56" height="h-9" />
          <SkLine width="w-80" />
        </div>
        <SkButton width="w-28" height="h-10" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-3 border-border bg-card p-5">
            <SkLine width="w-20" height="h-3" />
            <SkLine width="w-24" height="h-8" />
          </Card>
        ))}
      </section>

      <Card className="flex flex-col gap-3 border-border bg-card p-4 md:flex-row">
        <SkLine className="flex-1" height="h-11" />
        <SkBadge width="w-36" height="h-11" />
        <SkBadge width="w-36" height="h-11" />
      </Card>

      <Card className="overflow-hidden border-border bg-card">
        <div className="hidden grid-cols-7 gap-4 border-b border-border px-4 py-3 md:grid">
          {columnWidths.map((width, index) => (
            <SkLine key={index} width={width} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 items-center gap-3 p-4 md:grid-cols-7 md:gap-4"
            >
              <div className="flex items-center gap-3">
                <SkCircle size="w-9 h-9" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkLine width="w-3/4" />
                  <SkLine width="w-5/6" height="h-3" />
                </div>
              </div>
              <div className="space-y-2">
                <SkLine width="w-4/5" />
                <SkLine width="w-1/2" height="h-3" />
              </div>
              <SkBadge width="w-28" />
              <SkBadge width="w-20" />
              <SkCircle size="w-5 h-5" />
              <SkLine width="w-2/3" />
              <div className="hidden justify-end md:flex">
                <SkButton width="w-10" height="h-9" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border p-4">
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
