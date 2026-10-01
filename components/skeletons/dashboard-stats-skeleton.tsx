import { Card } from "@/components/ui/card";
import { SkLine, SkTitle } from "@/components/skeletons/primitives";

export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          className="space-y-4 border-border bg-card p-5 shadow-sm"
        >
          <SkLine width="w-2/3" height="h-4" />
          <SkTitle width="w-1/2" height="h-8" />
          <SkLine width="w-3/4" />
        </Card>
      ))}
    </div>
  );
}
