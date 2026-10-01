import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ShimmerRounded = "sm" | "md" | "lg" | "xl" | "full";
export type ShimmerTone = "default" | "navy" | "copper" | "dark";

type ShimmerProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: ShimmerRounded;
  tone?: ShimmerTone;
};

const ROUNDED: Record<ShimmerRounded, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const TONE_BG: Record<ShimmerTone, string> = {
  default: "bg-primary/5",
  navy: "bg-primary/10",
  copper: "bg-accent/10",
  dark: "bg-cream/5",
};

export function Shimmer({
  className,
  rounded = "md",
  tone = "default",
  ...props
}: ShimmerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden",
        ROUNDED[rounded],
        TONE_BG[tone],
        `shimmer-tone-${tone}`,
        className
      )}
      {...props}
    >
      <div className="shimmer-sweep absolute inset-0" />
    </div>
  );
}
