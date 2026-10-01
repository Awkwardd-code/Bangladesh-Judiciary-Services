import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkLine,
} from "@/components/skeletons/primitives";

const cellWidths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-1/3", "w-3/5"];

export function AdminStudentsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex items-end justify-between gap-4">
        <SkHeading width="w-40" />
        <SkButton width="w-28" />
      </header>
      <Card className="mt-6 flex flex-col gap-3 border-border bg-card p-4 md:flex-row">
        <SkLine className="flex-1" height="h-10" />
        {Array.from({ length: 3 }, (_, index) => (
          <SkBadge key={index} width="w-36" height="h-10" />
        ))}
        <SkButton width="w-20" height="h-10" />
      </Card>
      <Card className="mt-5 overflow-hidden border-border bg-card p-4 sm:p-6">
        <div className="grid grid-cols-6 gap-4 border-b border-border pb-4">
          {Array.from({ length: 6 }, (_, index) => (
            <SkLine key={index} width={cellWidths[index]} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-4 py-4">
              {Array.from({ length: 6 }, (_, colIndex) => (
                <SkLine
                  key={colIndex}
                  width={cellWidths[(rowIndex + colIndex) % cellWidths.length]}
                  height="h-5"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <SkLine width="w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkButton key={index} width="w-9" height="h-9" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
