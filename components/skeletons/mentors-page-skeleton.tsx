import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkHeading,
  SkImage,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function MentorsPageSkeleton() {
  return (
    <main>
      <section className="bg-cream px-4 py-12 text-center sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <SkLine className="mx-auto" width="w-28" />
          <SkHeading className="mx-auto" width="w-2/3" />
          <SkLine className="mx-auto" width="w-5/6" />
        </div>
      </section>
      <section className="bg-cream px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row">
          <SkLine className="flex-1" height="h-10" />
          <SkBadge width="w-48" height="h-10" />
        </div>
      </section>
      <section className="bg-cream px-4 py-12 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <SkLine width="w-32" />
              <SkHeading width="w-56" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-lg border-border bg-card"
              >
                <SkImage aspect="aspect-[4/5]" />
                <div className="p-5 sm:p-6">
                  <SkTitle width="w-3/4" />
                  <SkLine className="mt-2" width="w-1/2" />
                  <div className="mt-4 flex gap-2">
                    <SkBadge />
                    <SkBadge />
                  </div>
                  <SkLine className="mt-4" />
                  <SkLine className="mt-2" width="w-5/6" />
                  <div className="mt-5 flex justify-between border-t border-border pt-4">
                    <SkLine width="w-20" />
                    <SkLine width="w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <SkBadge key={index} width="w-9" height="h-9" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function MentorDetailSkeleton() {
  return (
    <main>
      <section className="bg-cream px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-center md:gap-12">
          <SkImage
            aspect="aspect-[4/5]"
            className="mx-auto max-w-md border border-border"
          />
          <div className="space-y-4">
            <SkLine width="w-32" tone="copper" />
            <SkHeading width="w-3/4" />
            <SkLine width="w-2/3" height="h-4" />
            <SkLine width="w-40" />
          </div>
        </div>
      </section>
      <section className="bg-cream px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-prose">
          <SkHeading width="w-64" height="h-7" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <SkLine key={index} width={index === 5 ? "w-2/3" : "w-full"} />
            ))}
          </div>
          <SkHeading className="mt-10" width="w-40" height="h-6" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkBadge key={index} width="w-28" height="h-8" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
