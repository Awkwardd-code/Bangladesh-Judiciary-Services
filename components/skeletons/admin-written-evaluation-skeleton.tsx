import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkDivider,
  SkHeading,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

export function AdminWrittenEvaluationSkeleton() {
  return (
    <div className="-m-4 min-h-full bg-background sm:-m-6">
      <header
        className="
          sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4
          backdrop-blur-sm sm:px-6
        "
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2">
            <SkLine width="w-40" height="h-3" />
            <SkHeading width="w-64" height="h-8" />
            <SkLine width="w-48" height="h-4" />
          </div>
          <div className="flex items-center gap-3">
            <SkBadge width="w-20" height="h-6" />
            <SkButton width="w-32" height="h-10" />
          </div>
        </div>
      </header>

      <main
        className="
          mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2
        "
      >
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <SkLine width="w-32" height="h-5" />
            <SkButton width="w-24" height="h-8" />
          </div>
          <SkSquare
            className="mt-4 h-[70vh] w-full"
            size="h-[70vh]"
            rounded="md"
          />
          <SkLine className="mt-3" width="w-40" height="h-3" />
        </Card>

        <Card className="space-y-5 p-5 sm:p-6">
          <SkLine width="w-48" height="h-5" />

          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <section
                key={index}
                className="space-y-4 rounded-md border border-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkLine width="w-40" height="h-4" />
                    <SkLine width="w-full" height="h-4" />
                  </div>
                  <SkLine width="w-16" height="h-3" />
                </div>

                <div className="flex items-center gap-2">
                  <SkLine width="w-20" height="h-3" />
                  <SkSquare className="w-20" size="h-10" rounded="md" />
                  <SkLine width="w-24" height="h-3" />
                </div>

                <SkSquare className="w-full" size="h-12" rounded="md" />
                <SkDivider />
              </section>
            ))}
          </div>

          <div className="space-y-2">
            <SkLine width="w-32" height="h-4" />
            <SkSquare className="w-full" size="h-24" rounded="md" />
          </div>

          <div className="border-t border-border pt-4">
            <SkLine width="w-40" height="h-5" />
          </div>
        </Card>
      </main>

      <div
        className="
          sticky bottom-0 z-10 border-t border-border bg-background/95 px-4
          py-4 backdrop-blur-sm sm:px-6
        "
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <SkLine width="w-32" height="h-3" />
          <SkButton width="w-32" height="h-10" />
        </div>
      </div>
    </div>
  );
}
