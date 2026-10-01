import { Card } from "@/components/ui/card";
import {
  SkButton,
  SkHeading,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

export function ExamPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-12">
      <Card className="w-full space-y-6 border-border bg-card p-6 text-center sm:p-8">
        <SkSquare className="mx-auto" size="w-12 h-12" />
        <SkHeading className="mx-auto" width="w-80" />
        <SkLine />
        <div className="space-y-4 text-left">
          {Array.from({ length: 5 }, (_, index) => (
            <SkLine key={index} width={index === 4 ? "w-5/6" : "w-full"} />
          ))}
        </div>
        <SkButton className="w-full" width="w-full" height="h-12" />
        <SkLine className="mx-auto" width="w-full" />
      </Card>
    </div>
  );
}
