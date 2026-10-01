import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function ModelTestsPageSkeleton() {
  return (
    <main>
      <section className="bg-primary-dark px-4 py-12 text-center text-cream sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <SkLine className="mx-auto" width="w-28" tone="copper" />
          <SkHeading className="mx-auto" width="w-5/6" tone="dark" />
          <SkLine className="mx-auto" width="w-2/3" tone="dark" />
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <SkButton width="w-40" height="h-11" tone="copper" />
            <SkButton width="w-40" height="h-11" tone="dark" />
          </div>
        </div>
      </section>
      <section className="bg-cream px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-3">
          <SkButton className="flex-1" width="w-full" height="h-10" />
          {Array.from({ length: 3 }, (_, index) => (
            <SkBadge key={index} width="w-24" height="h-9" />
          ))}
        </div>
      </section>
      <section className="bg-cream px-4 py-12 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <SkLine width="w-20" />
          <SkHeading className="mt-3" width="w-2/3" />
          <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-8">
            {Array.from({ length: 8 }, (_, index) => (
              <Card key={index} className="border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <SkBadge />
                  <SkLine width="w-16" height="h-5" />
                </div>
                <SkTitle className="mt-3" width="w-3/4" />
                <SkLine className="mt-2" />
                <SkLine className="mt-2" width="w-5/6" />
                <div className="my-4 grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }, (_, statIndex) => (
                    <div key={statIndex} className="space-y-2">
                      <SkLine width="w-1/2" />
                      <SkTitle width="w-3/4" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <SkButton />
                  <SkLine width="w-20" />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <SkButton key={index} width="w-9" height="h-9" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
