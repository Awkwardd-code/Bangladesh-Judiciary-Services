import { Card } from "@/components/ui/card";
import {
  SkButton,
  SkHeading,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

export function WrittenSubmissionSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="min-h-[70vh] border-border bg-card p-4 sm:p-6">
        <SkSquare className="h-full w-full" size="min-h-[60vh]" />
      </Card>
      <Card className="space-y-6 border-border bg-card p-5">
        <SkHeading width="w-2/3" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-3 border-b border-border pb-5">
            <SkLine width="w-32" />
            <SkSquare className="w-full" size="h-10" />
            <SkLine width="w-5/6" />
          </div>
        ))}
        <SkButton width="w-full" height="h-11" />
      </Card>
    </div>
  );
}
