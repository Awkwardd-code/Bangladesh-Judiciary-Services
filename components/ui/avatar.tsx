import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-primary-dark",
        className,
      )}
      {...props}
    />
  );
}
