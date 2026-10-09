import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminLeaderboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="space-y-3">
        <SkHeading width="w-64" />
        <SkLine width="w-96" />
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:flex-row">
        <SkButton width="w-full lg:w-72" />
        <SkButton width="w-full lg:w-48" />
        <SkButton width="w-full lg:flex-1" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden grid-cols-8 gap-4 border-b border-border px-4 py-3 md:grid">
          {Array.from({ length: 8 }, (_, index) => (
            <SkLine key={index} width="w-20" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-8 md:items-center"
            >
              <SkCircle size="h-8 w-8" />
              <div className="flex items-center gap-3 md:col-span-1">
                <SkCircle size="h-8 w-8" />
                <div className="w-full space-y-2">
                  <SkLine width="w-28" />
                  <SkLine width="w-36" height="h-2" />
                </div>
              </div>
              <div className="space-y-2">
                <SkLine width="w-32" />
                <SkBadge />
              </div>
              <SkTitle width="w-12" />
              <SkLine width="w-12" />
              <div className="flex gap-1">
                <SkCircle size="h-5 w-5" />
                <SkCircle size="h-5 w-5" />
                <SkCircle size="h-5 w-5" />
              </div>
              <SkLine width="w-20" />
              <SkButton width="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
