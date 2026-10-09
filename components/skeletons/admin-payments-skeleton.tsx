import { Card } from "@/components/ui/card";
import { SkBadge, SkLine, SkTitle } from "@/components/skeletons/primitives";

const columnWidths = ["w-4/5", "w-3/4", "w-1/2", "w-2/3", "w-2/3", "w-2/3"];

export function AdminPaymentsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <SkTitle width="w-40" height="h-9" />
        <SkLine className="mt-2" width="w-64" />
        <SkLine className="mt-4" width="w-full" />
        <SkLine className="mt-1" width="w-4/5" />
      </header>

      <Card className="mt-6 flex flex-col gap-3 border-border bg-card p-4 lg:flex-row">
        <SkLine className="flex-1" height="h-10" />
        <SkBadge width="w-36" height="h-10" />
        <SkBadge width="w-36" height="h-10" />
        <div className="flex items-center gap-2">
          <SkLine width="w-24" height="h-10" />
          <SkLine width="w-24" height="h-10" />
        </div>
      </Card>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-2 border-border bg-card p-4">
            <SkLine width="w-28" height="h-3" />
            <SkLine width="w-32" height="h-7" />
          </Card>
        ))}
      </section>

      <Card className="mt-6 overflow-hidden border-border bg-card">
        <div className="hidden grid-cols-6 gap-4 border-b border-border p-4 md:grid">
          {columnWidths.map((width, index) => (
            <SkLine key={index} width={width} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 gap-3 p-4 md:grid-cols-6 md:items-center md:gap-4"
            >
              <SkLine width="w-4/5" />
              <div className="space-y-2">
                <SkLine width="w-3/4" />
                <SkLine width="w-5/6" height="h-3" />
              </div>
              <SkLine width="w-1/2" />
              <SkLine width="w-2/3" />
              <SkBadge width="w-20" />
              <SkLine width="w-2/3" />
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4 flex items-center justify-between">
        <SkLine width="w-28" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkLine
              key={index}
              width="w-9"
              height="h-9"
              className="rounded-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
