import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkImage,
  SkLine,
} from "@/components/skeletons/primitives";

export function CourseDetailSkeleton() {
  return (
    <main>
      <section className="bg-cream px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl space-y-4">
          <SkLine width="w-24" tone="copper" />
          <SkHeading width="w-2/3" />
          <SkLine width="w-3/4" />
          <div className="flex flex-wrap gap-3 pt-2">
            <SkBadge width="w-28" height="h-8" />
            <SkBadge width="w-28" height="h-8" />
            <SkBadge width="w-28" height="h-8" />
          </div>
        </div>
      </section>
      <section className="bg-cream px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <SkImage aspect="aspect-[16/9]" />
            <div>
              <SkHeading width="w-64" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkLine
                    key={index}
                    width={index === 5 ? "w-2/3" : "w-full"}
                  />
                ))}
              </div>
            </div>
          </div>
          <Card className="h-fit space-y-5 border-border bg-card p-6 lg:sticky lg:top-24">
            <SkHeading width="w-3/4" />
            <SkLine />
            <SkLine width="w-5/6" />
            <SkButton className="w-full" width="w-full" height="h-12" />
          </Card>
        </div>
      </section>
    </main>
  );
}
