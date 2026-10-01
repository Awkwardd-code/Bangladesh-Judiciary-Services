import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkImage,
  SkLine,
  SkSquare,
  SkTitle,
} from "@/components/skeletons/primitives";

export function HomeWhySkeleton() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center">
          <SkHeading width="w-72" />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Card
              key={index}
              className="flex flex-col gap-3 border-border bg-card p-5"
            >
              <SkSquare size="w-8 h-8" />
              <SkTitle width="w-32" />
              <SkLine />
              <SkLine width="w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCoursesSkeleton() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SkHeading width="w-56" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card
              key={index}
              className="overflow-hidden rounded-lg border-border bg-card"
            >
              <SkImage />
              <div className="space-y-4 p-6">
                <SkLine width="w-20" height="h-4" />
                <SkTitle width="w-3/4" />
                <SkLine />
                <div className="flex items-center justify-between">
                  <SkBadge />
                  <SkLine width="w-16" height="h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeModelTestsSkeleton() {
  return (
    <section className="bg-primary-dark px-6 py-16 text-cream lg:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-5">
          <SkHeading width="w-96" height="h-10" tone="dark" />
          <SkLine width="w-full" height="h-4" tone="dark" />
          <SkLine width="w-5/6" tone="dark" />
          <SkButton width="w-40" height="h-10" tone="copper" />
        </div>
        <SkSquare
          size="h-56 w-full max-w-md"
          rounded="xl"
          tone="dark"
          className="ml-auto"
        />
      </div>
    </section>
  );
}

export function HomeMentorSkeleton() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="space-y-5 border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <SkImage aspect="aspect-[3/4]" className="w-24 shrink-0" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkLine width="w-32" height="h-3" />
              <SkTitle width="w-64" height="h-8" />
              <SkLine />
              <SkLine width="w-5/6" />
              <SkLine width="w-4/6" />
            </div>
          </div>
          <SkLine width="w-full" height="h-12" />
        </Card>
        <Card className="flex flex-col justify-between border-border bg-card p-6">
          <div className="space-y-4">
            <SkHeading width="w-4/5" />
            <SkLine width="w-3/4" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <SkButton width="w-36" />
            <SkButton width="w-32" />
          </div>
        </Card>
      </div>
    </section>
  );
}

export function HomeCtaSkeleton() {
  return (
    <section className="bg-primary-dark px-6 py-20 text-cream lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <SkHeading width="w-80" height="h-10" tone="dark" />
        <SkLine width="w-64" tone="dark" />
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <SkButton width="w-40" height="h-12" tone="copper" />
          <SkButton width="w-40" height="h-12" tone="dark" />
        </div>
      </div>
    </section>
  );
}

export function HomeStoriesSkeleton() {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <SkLine width="w-32" tone="copper" />
            <SkHeading width="w-96" />
          </div>
          <SkLine width="w-28" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="flex flex-col gap-4 p-5">
              <SkLine width="w-6" height="h-6" tone="copper" />
              <SkLine className="flex-1" height="h-24" />
              <div className="space-y-3 border-t border-border pt-4">
                <SkTitle width="w-32" />
                <SkLine width="w-40" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
