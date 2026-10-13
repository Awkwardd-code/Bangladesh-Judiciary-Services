"use client";

import {
  SkBadge,
  SkHeading,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <SkHeading width="w-40" height="h-9" />
          <SkLine width="w-60" />
        </div>
        <div className="flex items-center gap-3">
          <SkLine width="w-32" />
          <SkSquare size="w-24 h-10" rounded="md" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <SkLine width="w-20" />
              <SkSquare size="w-5 h-5" />
            </div>
            <SkTitle width="w-16" height="h-8" className="mt-5" />
            <SkLine width="w-20" className="mt-2" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <SkTitle width="w-40" />
            <SkLine width="w-16" />
          </div>
          <SkSquare size="h-[260px] w-full" rounded="md" />
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <SkTitle width="w-36" />
            <SkLine width="w-16" />
          </div>
          <SkSquare size="h-[260px] w-full" rounded="md" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <SkTitle width="w-32" />
              <SkLine width="w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <SkSquare size="w-8 h-8" rounded="full" />
                    <div className="space-y-2">
                      <SkLine width="w-24" />
                      <SkLine width="w-20" />
                    </div>
                  </div>
                  <SkBadge width="w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-primary">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <SkSquare size="w-10 h-10" rounded="md" />
                <div className="flex-1 space-y-2">
                  <SkLine width="w-20" />
                  <SkLine width="w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
