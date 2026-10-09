import {
  SkBadge,
  SkCircle,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

type ListSkeletonProps = {
  count?: number;
  hasThumb?: boolean;
  hasRightAction?: boolean;
};

export function ListSkeleton({
  count = 6,
  hasThumb = false,
  hasRightAction = true,
}: ListSkeletonProps) {
  return (
    <div className="divide-y divide-border px-5 sm:px-6" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-4 py-4">
          {hasThumb ? <SkCircle size="w-10 h-10" /> : null}

          <div className="min-w-0 flex-1 space-y-2">
            <SkLine width="w-1/2" height="h-4" />
            <SkLine width="w-1/3" />
          </div>

          {hasRightAction ? (
            <SkBadge width="w-16" />
          ) : (
            <SkSquare size="w-9 h-9" />
          )}
        </div>
      ))}
    </div>
  );
}
