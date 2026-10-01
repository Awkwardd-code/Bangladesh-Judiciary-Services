import { Card } from "@/components/ui/card";
import { SkButton, SkLine, SkSquare } from "@/components/skeletons/primitives";

export function ExamTakingSkeleton() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <SkLine width="w-48" height="h-5" />
        <div className="flex items-center gap-4">
          <SkLine width="w-24" height="h-6" />
          <SkButton width="w-28" />
        </div>
      </header>
      <SkSquare className="w-full" size="h-10" tone="copper" />
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, questionIndex) => (
          <Card
            key={questionIndex}
            className="space-y-4 border-border bg-card p-5 sm:p-6"
          >
            <SkLine width="w-16" height="h-5" />
            <SkLine />
            <SkLine width="w-5/6" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, optionIndex) => (
                <SkSquare key={optionIndex} className="w-full" size="h-12" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
