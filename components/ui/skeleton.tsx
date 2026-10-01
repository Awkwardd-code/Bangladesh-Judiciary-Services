import type { HTMLAttributes } from "react";

import { Shimmer } from "@/components/ui/shimmer";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <Shimmer className={className} rounded="md" {...props} />;
}
