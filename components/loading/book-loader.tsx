import { cn } from "@/lib/utils";

type BookLoaderProps = {
  compact?: boolean;
};

export function BookLoader({ compact = false }: BookLoaderProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-8 bg-background",
        compact ? "py-8" : "min-h-screen",
      )}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn("book-loader", compact && "book-loader--compact")}
        aria-hidden="true"
      >
        <div className="book-loader__back" />
        <div className="book-loader__pages book-loader__pages--1" />
        <div className="book-loader__pages book-loader__pages--2" />
        <div className="book-loader__pages book-loader__pages--3" />
        <div className="book-loader__cover" />
        <div className="book-loader__spine" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary/70">
          BJS Prep
        </p>
        <p className="text-xs text-muted">Preparing your study room...</p>
      </div>
    </div>
  );
}