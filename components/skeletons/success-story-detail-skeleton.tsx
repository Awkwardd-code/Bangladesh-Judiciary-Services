import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkHeading,
  SkImage,
  SkLine,
} from "@/components/skeletons/primitives";

export function SuccessStoryDetailSkeleton() {
  return (
    <main className="bg-cream px-6 py-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SkImage aspect="aspect-[4/5]" className="mx-auto max-w-md" />
          <div className="space-y-5">
            <SkLine width="w-32" tone="copper" />
            <SkHeading width="w-3/4" />
            <div className="flex flex-wrap gap-2">
              <SkBadge width="w-28" />
              <SkBadge width="w-24" />
            </div>
            <SkBadge width="w-40" height="h-7" tone="copper" />
            <Card className="border-border bg-card p-6">
              <SkLine width="w-8" height="h-8" tone="copper" />
              <div className="mt-4 space-y-3">
                <SkLine />
                <SkLine width="w-5/6" />
              </div>
            </Card>
          </div>
        </div>
        <section className="mx-auto mt-12 max-w-4xl space-y-5">
          <SkHeading width="w-1/2" />
          <SkLine />
          <SkLine />
          <SkLine />
          <SkLine width="w-5/6" />
        </section>
      </div>
    </main>
  );
}
