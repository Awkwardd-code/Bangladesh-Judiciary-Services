import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function ResultsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="space-y-3">
        <SkTitle width="w-40" height="h-8" />
        <SkLine width="w-64" />
      </div>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="space-y-4 p-6">
            <SkLine width="w-24" />
            <SkTitle width="w-28" height="h-9" />
            <SkLine width="w-40" />
          </Card>
        ))}
      </section>
      <section className="mt-8 space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="border-border bg-card p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 space-y-3">
                <SkBadge width="w-24" />
                <SkTitle width="w-3/4" />
                <div className="flex flex-wrap gap-4">
                  <SkLine width="w-24" />
                  <SkLine width="w-20" />
                  <SkLine width="w-28" />
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="space-y-2 text-right">
                  <SkLine width="w-12" />
                  <SkTitle width="w-16" height="h-8" />
                </div>
                <SkBadge width="w-20" />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <SkButton width="w-28" />
              <SkLine className="self-center" width="w-24" />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function ExamResultDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <SkLine width="w-16" />
            <SkTitle width="w-80" height="h-9" />
          </div>
          <div className="flex flex-wrap gap-3">
            <SkBadge width="w-24" height="h-7" />
            <SkBadge width="w-36" height="h-7" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="space-y-3 border-border p-4">
              <SkLine width="w-20" />
              <SkTitle width="w-12" height="h-7" />
            </Card>
          ))}
        </div>
      </Card>
      <div className="mt-8 space-y-5">
        {Array.from({ length: 5 }, (_, questionIndex) => (
          <Card key={questionIndex} className="border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <SkTitle className="flex-1" width="w-3/4" height="h-6" />
              <SkBadge width="w-20" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }, (_, optionIndex) => (
                <SkLine
                  key={optionIndex}
                  className="w-full border border-border p-3"
                  height="h-11"
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <SkBadge width="w-20" />
              <SkBadge width="w-20" />
            </div>
            <div className="mt-4 space-y-2 rounded-md border border-border p-3">
              <SkLine width="w-24" />
              <SkLine />
              <SkLine width="w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
