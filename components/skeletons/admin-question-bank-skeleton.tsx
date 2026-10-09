import { Card } from "@/components/ui/card";
import { SkBadge, SkButton, SkLine } from "@/components/skeletons/primitives";

const columnWidths = ["w-24", "w-4/5", "w-2/3", "w-12", "w-16"];

export function AdminQuestionBankSkeleton() {
  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <SkLine width="w-14" height="h-3" />
          <SkLine width="w-56" height="h-9" />
        </div>
        <SkButton width="w-36" height="h-11" className="rounded-full" />
      </header>

      <Card className="border-border bg-card p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <SkLine height="h-11" />
          <SkBadge width="w-full" height="h-11" className="rounded-md" />
          <SkBadge width="w-full" height="h-11" className="rounded-md" />
        </div>
      </Card>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_3fr_1fr_0.7fr_0.8fr] gap-4 bg-primary/5 px-4 py-3 md:grid">
          {columnWidths.map((width, index) => (
            <SkLine key={index} width={width} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1fr_3fr_1fr_0.7fr_0.8fr] md:items-center md:gap-4"
            >
              <SkBadge width="w-24" />
              <div className="space-y-2">
                <SkLine width="w-full" />
                <SkLine width="w-4/5" />
              </div>
              <SkBadge width="w-24" />
              <SkLine width="w-10" />
              <div className="flex md:justify-end">
                <SkButton width="w-20" height="h-9" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
