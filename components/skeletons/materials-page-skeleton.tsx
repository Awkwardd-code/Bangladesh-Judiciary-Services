import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function MaterialsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="space-y-3">
        <SkTitle width="w-40" height="h-8" />
        <SkLine width="w-64" />
      </div>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <SkLine className="flex-1" height="h-10" />
        <SkBadge width="w-40" height="h-10" />
        <SkBadge width="w-40" height="h-10" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="space-y-4 border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <SkSquare size="w-6 h-6" />
              <SkBadge />
            </div>
            <SkTitle width="w-3/4" />
            <SkLine width="w-1/2" />
            <SkLine width="w-20" />
          </Card>
        ))}
      </div>
    </div>
  );
}
