import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminStudentDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-2">
        <SkLine width="w-20" />
        <SkLine width="w-3" />
        <SkLine width="w-28" />
      </div>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <SkHeading width="w-56" />
          <SkLine width="w-64" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SkButton width="w-36" />
          <SkButton width="w-24" />
        </div>
      </header>

      <Card className="mt-8 border-border bg-card p-5 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <SkCircle size="w-16 h-16" />
          <div className="space-y-2">
            <SkTitle width="w-44" height="h-6" />
            <SkLine width="w-56" />
            <div className="flex items-center gap-2">
              <SkBadge width="w-24" />
              <SkBadge width="w-20" />
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-border" />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkLine width="w-24" height="h-3" />
              <SkLine
                width={index % 2 === 0 ? "w-2/3" : "w-1/2"}
                height="h-4"
              />
            </div>
          ))}
        </div>
      </Card>

      <section className="mt-8">
        <SkHeading width="w-36" height="h-6" />
        <Card className="mt-4 overflow-hidden border-border bg-card">
          <div className="flex flex-col items-center py-12">
            <SkCircle size="w-10 h-10" />
            <SkLine className="mt-4" width="w-40" />
            <SkLine className="mt-2" width="w-64" />
          </div>
        </Card>
      </section>
    </div>
  );
}
