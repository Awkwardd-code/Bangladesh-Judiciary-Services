import { Card } from "@/components/ui/card";
import { SkLine } from "@/components/skeletons/primitives";

export function FilterBarSkeleton({ selects = 2 }: { selects?: number }) {
  return (
    <Card
      className="flex flex-col gap-3 border-border bg-card p-4 md:flex-row"
      aria-hidden="true"
    >
      <SkLine className="flex-1" height="h-10" />
      {Array.from({ length: selects }, (_, index) => (
        <SkLine key={index} className="md:w-40" height="h-10" />
      ))}
    </Card>
  );
}
