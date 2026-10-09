import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminFreeTestEditorSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Saving free test">
      <header className="sticky top-16 z-20 border-b border-border bg-background/95 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkLine width="w-36" />
            <SkHeading width="w-64" />
            <SkLine width="w-48" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SkButton width="w-24" height="h-11" />
            <SkButton width="w-32" height="h-11" />
            <SkButton width="w-40" height="h-11" />
          </div>
        </div>
      </header>

      <Card className="border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 sm:flex-col">
              <SkCircle size="w-8 h-8" />
              <SkLine width={index === 1 ? "w-24" : "w-16"} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 border-border bg-card p-5">
        <SkTitle width="w-40" />
        <SkLine width="w-3/4" />
        <SkLine width="w-full" height="h-2" />
      </Card>

      <Card className="space-y-5 border-border bg-card p-6">
        <SkTitle width="w-36" />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className={index < 2 ? "space-y-2 lg:col-span-2" : "space-y-2"}
            >
              <SkLine width="w-32" />
              <SkSquare
                className="w-full"
                size={index === 1 ? "h-24" : "h-11"}
                rounded="md"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-5 border-border bg-card p-6">
        <div className="space-y-2">
          <SkTitle width="w-40" />
          <SkLine width="w-3/4" />
        </div>
        <div className="flex gap-2 border-b border-border pb-3">
          <SkButton width="w-32" />
          <SkButton width="w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, panelIndex) => (
            <div
              key={panelIndex}
              className="space-y-3 rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <SkTitle width="w-28" />
                <SkButton width="w-9" height="h-9" />
              </div>
              <SkButton width="w-full" height="h-11" />
              <SkButton width="w-full" height="h-10" />
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="space-y-2 rounded-lg border border-border bg-card p-3"
                >
                  <SkLine width="w-full" height="h-4" />
                  <div className="flex gap-2">
                    <SkBadge width="w-24" />
                    <SkBadge width="w-20" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
