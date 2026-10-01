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
      <div className="flex gap-3 border-b border-border pb-4">
        <SkButton width="w-28" />
        <SkButton width="w-28" />
      </div>
      <header className="mt-6 flex items-center justify-between gap-4">
        <SkHeading width="w-48" />
        <SkButton width="w-32" />
      </header>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="space-y-4 border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <SkBadge />
              <SkLine width="w-16" />
            </div>
            <SkTitle width="w-3/4" />
            <SkLine />
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
    </div>
  );
}
