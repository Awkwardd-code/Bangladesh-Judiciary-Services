import { Card } from "@/components/ui/card";
import { SkLine, SkTitle } from "@/components/skeletons/primitives";

type StatCardsSkeletonProps = {
  count?: number;
  columns?: 3 | 4;
};

export function StatCardsSkeleton({
  count = 4,
  columns = 4,
}: StatCardsSkeletonProps) {
  const columnClass = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${columnClass}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="space-y-3 border-border bg-card p-5">
          <SkLine width="w-24" />
          <SkTitle width="w-16" height="h-8" />
          <SkLine width="w-20" />
        </Card>
      ))}
    </div>
  );
}
