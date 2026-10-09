import { Card } from "@/components/ui/card";
import { SkBadge, SkButton, SkLine } from "@/components/skeletons/primitives";

export function AdminNoticesSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkLine width="w-40" height="h-9" />
          <SkLine width="w-64" />
        </div>
      </header>

      <div className="mt-5 flex justify-end">
        <SkButton width="w-32" height="h-10" />
      </div>
      <Card className="mt-6 flex flex-col gap-3 border-border bg-card p-4 sm:flex-row">
        <SkLine className="flex-1" height="h-10" />
        <SkBadge width="w-36" height="h-10" />
      </Card>

      <Card className="mt-5 overflow-hidden border-border bg-card">
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <SkLine width="w-2/3" />
                <SkLine width="w-5/6" />
              </div>
              <div className="flex items-center gap-3">
                <SkBadge width="w-20" />
                <SkButton width="w-9" height="h-9" />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4 flex items-center justify-between">
        <SkLine width="w-28" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkButton key={index} width="w-9" height="h-9" />
          ))}
        </div>
      </div>
    </div>
  );
}
