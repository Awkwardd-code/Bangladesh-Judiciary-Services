import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function StudentExamsSkeleton() {
  return (
    <main
      aria-label="Loading tests"
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-6"
    >
      <header className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="space-y-3">
          <SkBadge width="w-36" />
          <SkTitle width="w-72" height="h-9" />
          <SkLine width="w-96" height="h-4" />
        </div>
        <SkButton width="w-48" height="h-10" />
      </header>

      <Card className="space-y-4 border-border/80 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <SkBadge width="w-36" />
            <SkTitle width="w-56" height="h-6" />
          </div>
          <SkLine width="w-32" />
        </div>
        <SkLine height="h-2" className="rounded-full" />
      </Card>

      <div className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <SkLine height="h-11" className="rounded-xl" />
        <SkLine height="h-11" className="rounded-xl" />
        <SkLine height="h-11" className="rounded-xl" />
      </div>

      <section className="space-y-5">
        {Array.from({ length: 3 }, (_, groupIndex) => (
          <Card
            key={groupIndex}
            className="overflow-hidden border-border/80 p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SkLine
                width="w-full sm:w-32"
                height="h-20"
                className="shrink-0 rounded-xl"
              />
              <div className="flex-1 space-y-3">
                <SkBadge width="w-28" />
                <SkTitle width="w-64" height="h-6" />
                <SkLine width="w-full" />
              </div>
              <SkBadge width="w-20" height="h-8" />
            </div>
            {groupIndex === 0 ? (
              <div className="mt-5 space-y-4 border-t border-border pt-4">
                {Array.from({ length: 2 }, (_, examIndex) => (
                  <div
                    key={examIndex}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <SkBadge width="w-9" height="h-9" />
                      <div className="flex-1 space-y-2">
                        <SkTitle width="w-1/2" height="h-4" />
                        <SkLine width="w-1/3" />
                      </div>
                    </div>
                    <SkButton width="w-28" height="h-10" />
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </section>
    </main>
  );
}
