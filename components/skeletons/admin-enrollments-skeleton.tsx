import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

const cellWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5", "w-1/3"];

export function AdminEnrollmentsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkTitle width="w-44" height="h-9" />
          <SkLine width="w-72" />
        </div>
        <SkButton width="w-28" />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-2 border-border bg-card p-4">
            <SkLine width="w-20" height="h-3" />
            <SkTitle width="w-24" />
            <SkLine width="w-28" height="h-3" />
          </Card>
        ))}
      </section>

      <Card className="mt-8 flex flex-col gap-3 border-border bg-card p-4 md:flex-row">
        <SkLine className="flex-1" height="h-11" />
        {Array.from({ length: 3 }, (_, index) => (
          <SkBadge key={index} width="w-36" height="h-11" />
        ))}
      </Card>

      <Card className="mt-5 overflow-hidden border-border bg-card p-4 sm:p-6">
        <div className="hidden grid-cols-6 gap-4 border-b border-border pb-3 md:grid">
          {cellWidths.map((width, index) => (
            <SkLine key={index} width={width} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 gap-3 py-4 md:grid-cols-6 md:items-center md:gap-4"
            >
              {cellWidths.map((width, colIndex) => (
                <SkLine key={colIndex} width={width} height="h-5" />
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
