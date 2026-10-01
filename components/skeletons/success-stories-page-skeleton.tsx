import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkCircle,
  SkHeading,
  SkImage,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function SuccessStoriesPageSkeleton() {
  return (
    <main>
      <section className="bg-cream px-6 py-12 text-center md:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <SkLine className="mx-auto" width="w-32" tone="copper" />
          <SkHeading className="mx-auto" width="w-2/3" />
          <SkLine className="mx-auto" width="w-5/6" />
        </div>
      </section>
      <section className="bg-cream px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row">
          <SkLine className="flex-1" height="h-10" />
          <SkBadge width="w-32" height="h-10" />
        </div>
      </section>
      <section className="bg-cream px-6 py-12 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <Card
              key={index}
              className="overflow-hidden rounded-lg border-border bg-card"
            >
              <SkImage aspect="aspect-[4/3]" />
              <div className="flex flex-1 flex-col p-6">
                <SkLine width="w-6" height="h-6" tone="copper" />
                <div className="mt-3 space-y-2">
                  <SkLine />
                  <SkLine />
                  <SkLine />
                  <SkLine width="w-5/6" />
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <SkCircle />
                  <div className="flex-1 space-y-2">
                    <SkTitle width="w-32" height="h-4" />
                    <SkLine width="w-40" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <SkBadge width="w-28" />
                  <SkLine width="w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
