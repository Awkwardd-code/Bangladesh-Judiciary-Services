import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminMockExamsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <SkHeading width="w-48" />
          <SkLine width="w-64" height="h-4" />
        </div>
        <SkButton width="w-32" height="h-10" />
      </header>

      <div className="mt-6">
        <div className="flex gap-3">
          <SkBadge width="w-28" height="h-9" />
          <SkBadge width="w-28" height="h-9" />
        </div>

        <div className="mt-5">
          <AdminMockExamCardsSkeleton />
        </div>
      </div>
    </div>
  );
}

export function AdminMockExamCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="space-y-4 border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <SkBadge />
            <SkLine width="w-16" height="h-5" />
          </div>

          <SkTitle width="w-3/4" height="h-5" />
          <SkLine width="w-full" height="h-3" />

          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            {Array.from({ length: 3 }, (_, statIndex) => (
              <div key={statIndex} className="space-y-2">
                <SkLine width="w-1/2" />
                <SkTitle width="w-3/4" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <SkLine width="w-20" />
            <SkBadge width="w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}
