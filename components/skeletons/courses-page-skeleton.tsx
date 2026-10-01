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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row">
          <SkButton className="flex-1" width="w-full" height="h-10" />
          <SkButton width="w-44" height="h-10" />
          <SkButton width="w-44" height="h-10" />
          <SkButton width="w-32" height="h-10" />
        </div>
      </section>
      <section className="bg-cream px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 9 }, (_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <SkHeading width="w-48" />
        <SkButton width="w-36" />
      </header>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card
            key={index}
            className="rounded-lg border-border bg-card p-4 shadow-sm"
          >
            <SkImage aspect="h-28" />
            <SkTitle className="mt-4" width="w-3/4" />
            <SkLine className="mt-2" />
            <SkLine className="mt-2" width="w-5/6" />
            <div className="mt-4 flex items-center justify-between">
              <SkLine width="w-24" />
              <SkLine width="w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
