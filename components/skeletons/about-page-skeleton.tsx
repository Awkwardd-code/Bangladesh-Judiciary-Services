import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkCircle,
  SkHeading,
  SkImage,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AboutPageSkeleton() {
  return (
    <main>
      <section className="bg-cream px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SkLine className="mx-auto" width="w-32" tone="copper" />
          <div className="mt-4 space-y-3">
            <SkHeading className="mx-auto" width="w-5/6" />
            <SkHeading className="mx-auto" width="w-2/3" />
          </div>
          <div className="mx-auto mt-6 max-w-2xl space-y-2">
            <SkLine />
            <SkLine width="w-5/6" />
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <SkTitle width="w-16" height="h-7" />
                <SkLine width="w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <SkLine width="w-28" tone="copper" />
            <SkHeading width="w-5/6" />
          </div>
          <div className="space-y-5 lg:col-span-7">
            <SkLine />
            <SkLine />
            <SkLine width="w-5/6" />
          </div>
        </div>
      </section>
      <section className="bg-primary px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <SkLine className="mx-auto" width="w-28" tone="copper" />
            <SkHeading className="mx-auto" width="w-3/4" tone="dark" />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index} className="border-cream/10 bg-cream/[0.03] p-6">
                <SkSquare tone="copper" />
                <SkTitle className="mt-4" width="w-3/4" tone="dark" />
                <SkLine className="mt-3" tone="dark" />
                <SkLine className="mt-2" width="w-5/6" tone="dark" />
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cream px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <SkLine className="mx-auto" width="w-40" tone="copper" />
            <SkHeading className="mx-auto" width="w-3/4" />
          </div>
          <Card className="mt-12 overflow-hidden border-border bg-card">
            <div className="grid grid-cols-2 gap-4 border-b border-border px-6 py-4">
              <SkLine width="w-2/3" />
              <SkLine width="w-1/2" />
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 border-b border-border px-6 py-4 last:border-b-0"
              >
                <SkLine width="w-5/6" height="h-5" />
                <div className="flex items-start gap-3">
                  <SkCircle size="w-[18px] h-[18px]" tone="copper" />
                  <SkLine width="w-5/6" height="h-5" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>
      <section className="bg-cream px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SkHeading width="w-2/3" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Card
                key={index}
                className="overflow-hidden border-border bg-card"
              >
                <SkImage aspect="aspect-[4/5]" />
                <div className="space-y-3 p-5">
                  <SkTitle />
                  <SkLine width="w-2/3" />
                  <SkLine width="w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-cream px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SkHeading width="w-2/3" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <Card key={index} className="space-y-4 border-border bg-card p-6">
                <SkLine width="w-8" height="h-8" tone="copper" />
                <SkLine />
                <SkLine width="w-5/6" />
                <div className="flex items-center gap-3">
                  <SkCircle />
                  <SkTitle width="w-32" />
                </div>
                <SkBadge width="w-32" />
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-primary-dark px-6 py-20 text-cream lg:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <SkHeading width="w-3/4" tone="dark" />
          <SkLine width="w-2/3" tone="dark" />
          <div className="mt-4 flex gap-3">
            <SkBadge width="w-36" height="h-12" tone="copper" />
            <SkBadge width="w-36" height="h-12" tone="dark" />
          </div>
        </div>
      </section>
    </main>
  );
}
