import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function DashboardMockExamsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <SkTitle width="w-48" height="h-9" />
          <SkLine width="w-80" height="h-4" />
        </div>
        <SkButton width="w-36" height="h-10" />
      </header>
      <Card className="mt-6 flex flex-col gap-4 border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-2">
          <SkTitle width="w-64" />
          <SkLine width="w-40" />
        </div>
        <SkButton width="w-28" height="h-11" />
      </Card>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <SkLine className="flex-1" height="h-10" />
        <SkBadge width="w-40" height="h-10" />
        <SkBadge width="w-32" height="h-10" />
      </div>
      <section className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <Card key={index} className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <SkBadge />
              <SkLine width="w-20" />
            </div>
            <SkTitle className="mt-1" width="w-3/4" />
            <SkLine />
            <SkLine width="w-5/6" />
            <div className="flex gap-4">
              <SkLine width="w-28" />
              <SkLine width="w-20" />
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <SkLine width="w-32" />
              <SkButton width="w-24" />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
