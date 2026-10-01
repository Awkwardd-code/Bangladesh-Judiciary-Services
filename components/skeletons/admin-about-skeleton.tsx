import { Card } from "@/components/ui/card";
import { SkButton, SkLine } from "@/components/skeletons/primitives";

export function AdminAboutSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {Array.from({ length: 5 }, (_, index) => (
          <SkButton key={index} width="w-24" />
        ))}
      </div>
      <Card className="border-border bg-card p-5 sm:p-6">
        <div className="space-y-5">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkLine width="w-28" />
              <SkLine height="h-10" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
          <SkButton width="w-24" />
          <SkButton width="w-28" />
        </div>
      </Card>
    </div>
  );
}
