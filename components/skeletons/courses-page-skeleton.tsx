import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkImage,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <SkImage />
      <div className="p-6">
        <SkBadge width="w-20" />
        <SkTitle className="mt-3" width="w-3/4" />
        <SkLine className="mt-2" />
        <SkLine className="mt-2" width="w-5/6" />
        <div className="mt-6 flex items-center justify-between">
          <SkBadge width="w-28" />
          <SkLine width="w-20" height="h-5" />
        </div>
        <SkLine className="mt-4" width="w-24" />
      </div>
    </Card>
  );
}

export function CoursesPageSkeleton() {
  return (
    <main>
      <section className="bg-cream px-4 py-12 text-center sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <SkLine className="mx-auto" width="w-24" />
          <SkHeading className="mx-auto" width="w-96" height="h-10" />
          <SkLine className="mx-auto" width="w-2/3" height="h-4" />
        </div>
      </section>
      <section className="bg-cream px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center">
          <SkButton className="flex-1" width="w-full" height="h-10" />
          <SkButton width="w-full md:w-44" height="h-10" />
          <SkButton width="w-full md:w-36" height="h-10" />
          <SkButton width="w-full md:w-48" height="h-10" />
        </div>
      </section>
      <section className="bg-cream px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="h-fit space-y-5 border-border p-5">
            <SkTitle width="w-2/3" />
            <SkButton width="w-full" height="h-10" />
            <SkButton width="w-full" height="h-10" />
            <SkButton width="w-full" height="h-10" />
          </Card>
          <div>
            <div className="mb-4 flex justify-between">
              <SkLine width="w-32" />
              <SkButton width="w-48" height="h-10" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl justify-center gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkButton key={index} width="w-9" height="h-9" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function DashboardCoursesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true">
      <header className="flex flex-col gap-5 rounded-3xl bg-primary px-5 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="space-y-3">
          <SkBadge width="w-36" />
          <SkHeading width="w-48" />
          <SkLine width="w-96" />
        </div>
        <SkButton width="w-40" />
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="flex items-center justify-between p-5">
            <div className="space-y-2">
              <SkLine width="w-28" />
              <SkTitle width="w-16" />
              <SkLine width="w-36" />
            </div>
            <SkBadge width="w-10" height="h-10" />
          </Card>
        ))}
      </div>
      <Card className="space-y-4 border-border/80 p-5">
        <SkTitle width="w-36" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <SkButton key={index} width="w-28" height="h-9" />
          ))}
        </div>
      </Card>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card
            key={index}
            className="overflow-hidden rounded-2xl border-border bg-card shadow-sm"
          >
            <SkImage aspect="h-40" />
            <div className="space-y-3 p-5">
              <SkBadge width="w-28" />
              <SkTitle width="w-3/4" />
              <SkLine />
              <SkLine width="w-5/6" />
              <div className="flex items-center justify-between border-t border-border pt-4">
                <SkLine width="w-24" />
                <SkButton width="w-24" height="h-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
