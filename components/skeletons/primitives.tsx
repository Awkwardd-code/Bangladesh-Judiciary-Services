import { cn } from "@/lib/utils";
import {
  Shimmer,
  type ShimmerRounded,
  type ShimmerTone,
} from "@/components/ui/shimmer";

type LineProps = {
  width?: string;
  height?: string;
  tone?: ShimmerTone;
  className?: string;
};

export function SkLine({
  width = "w-full",
  height = "h-3",
  tone = "default",
  className,
}: LineProps) {
  return (
    <Shimmer
      className={cn(width, height, className)}
      rounded="sm"
      tone={tone}
    />
  );
}

export function SkTitle({
  width = "w-3/4",
  height = "h-5",
  tone = "default",
  className,
}: LineProps) {
  return (
    <Shimmer
      className={cn(width, height, className)}
      rounded="sm"
      tone={tone}
    />
  );
}

export function SkHeading({
  width = "w-1/2",
  height = "h-8",
  tone = "default",
  className,
}: LineProps) {
  return (
    <Shimmer
      className={cn(width, height, className)}
      rounded="sm"
      tone={tone}
    />
  );
}

export function SkCircle({
  size = "w-10 h-10",
  tone = "default",
  className,
}: {
  size?: string;
  tone?: ShimmerTone;
  className?: string;
}) {
  return <Shimmer className={cn(size, className)} rounded="full" tone={tone} />;
}

export function SkSquare({
  size = "w-10 h-10",
  rounded = "md",
  tone = "default",
  className,
}: {
  size?: string;
  rounded?: ShimmerRounded;
  tone?: ShimmerTone;
  className?: string;
}) {
  return (
    <Shimmer className={cn(size, className)} rounded={rounded} tone={tone} />
  );
}

export function SkButton({
  width = "w-24",
  height = "h-9",
  tone = "default",
  className,
}: LineProps) {
  return (
    <Shimmer
      className={cn(width, height, className)}
      rounded="md"
      tone={tone}
    />
  );
}

export function SkBadge({
  width = "w-16",
  height = "h-5",
  tone = "default",
  className,
}: LineProps) {
  return (
    <Shimmer
      className={cn(width, height, className)}
      rounded="full"
      tone={tone}
    />
  );
}

export function SkImage({
  aspect = "aspect-[16/9]",
  tone = "default",
  className,
}: {
  aspect?: string;
  tone?: ShimmerTone;
  className?: string;
}) {
  return (
    <Shimmer
      className={cn("w-full", aspect, className)}
      rounded="md"
      tone={tone}
    />
  );
}

export function SkDivider({
  width = "w-full",
  tone = "default",
  className,
}: {
  width?: string;
  tone?: ShimmerTone;
  className?: string;
}) {
  return (
    <Shimmer
      className={cn(width, "h-px", className)}
      rounded="sm"
      tone={tone}
    />
  );
}
