import { Card } from "@/components/ui/card";
import { SkButton } from "@/components/skeletons/primitives";

type FilterBarSkeletonProps = {
  hasSearch?: boolean;
  selects?: number;
  hasClear?: boolean;
};

export function FilterBarSkeleton({
  hasSearch = true,
  selects = 2,
  hasClear = true,
}: FilterBarSkeletonProps) {
  return (
    <Card
      className="
        flex flex-col gap-3 border-border bg-card p-4 md:flex-row
        md:items-center
      "
      aria-hidden="true"
    >
      {hasSearch ? (
        <SkButton width="w-full lg:w-72" height="h-10" className="flex-1" />
      ) : null}
      {Array.from({ length: selects }, (_, index) => (
        <SkButton key={index} width="w-full md:w-44" height="h-10" />
      ))}
      {hasClear ? <SkButton width="w-32" height="h-10" /> : null}
    </Card>
  );
}
