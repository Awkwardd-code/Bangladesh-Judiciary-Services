import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkLine,
} from "@/components/skeletons/primitives";

const columnWidths = [
  "w-10",
  "w-3/4",
  "w-5/6",
  "w-2/3",
  "w-1/2",
  "w-2/3",
  "w-10",
];

export function AdminMentorsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkLine width="w-40" height="h-9" />
          <SkLine width="w-72" />
        </div>
        <SkButton width="w-32" height="h-10" />
      </header>

      <Card className="mt-6 flex flex-col gap-3 border-border bg-card p-4 sm:flex-row">
        <SkLine className="flex-1" height="h-10" />
        <SkBadge width="w-36" height="h-10" />
      </Card>

      <Card className="mt-5 overflow-hidden border-border bg-card">
        <div className="hidden grid-cols-7 gap-4 border-b border-border px-5 py-3 md:grid">
          {columnWidths.map((width, index) => (
            <SkLine key={index} width={width} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 items-center gap-3 p-4 md:grid-cols-7 md:gap-4 md:px-5"
            >
              <div className="hidden md:block">
                <SkCircle size="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <SkLine width="w-3/4" />
                <SkLine width="w-1/2" height="h-3" />
              </div>
              <SkLine width="w-5/6" />
              <SkLine width="w-2/3" />
              <SkLine width="w-1/2" />
              <SkBadge width="w-20" />
              <div className="hidden justify-end md:flex">
                <SkButton width="w-9" height="h-9" />
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
