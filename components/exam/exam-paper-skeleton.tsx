import { Card } from "@/components/ui/card";
import { SkCircle, SkDivider, SkLine } from "@/components/skeletons/primitives";

export function ExamPaperSkeleton({
  withTimer = false,
  withFooter = false,
}: {
  withTimer?: boolean;
  withFooter?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Card className="overflow-visible rounded-lg border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col items-center">
              <SkLine width="w-64" height="h-8" />
              <SkLine className="mt-2" width="w-48" height="h-4" />
            </div>

            <SkDivider className="my-6" />

            <div className="flex flex-col items-center">
              <SkLine width="w-16" height="h-3" />
              <SkLine className="mt-2" width="w-72" height="h-6" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkLine width="w-20" height="h-3" />
                <SkLine width="w-24" height="h-4" />
              </div>
              <div className="space-y-2 text-right">
                <SkLine width="w-20" height="h-3" className="ml-auto" />
                <SkLine width="w-12" height="h-4" className="ml-auto" />
              </div>
            </div>

            <SkDivider className="my-6" />

            <div className="space-y-2">
              <SkLine width="w-full" height="h-3" />
              <SkLine width="w-5/6" height="h-3" />
            </div>
          </div>

          {withTimer ? (
            <div className="sticky top-0 z-30 border-y border-border bg-card px-6 py-3 shadow-sm lg:px-8">
              <SkLine width="w-full" height="h-10" />
            </div>
          ) : null}

          <div className="space-y-8 px-6 py-8 lg:px-8">
            {Array.from({ length: 4 }, (_, questionIndex) => (
              <div key={questionIndex} className="space-y-5">
                <div className="flex items-center gap-3">
                  <SkCircle size="w-8 h-8" />
                  <SkLine width="w-48" height="h-4" />
                </div>

                <div className="flex items-center gap-2">
                  <SkCircle size="w-4 h-4" />
                  <SkLine width="w-24" height="h-3" />
                </div>

                <div className="space-y-2">
                  <SkLine width="w-full" height="h-4" />
                  <SkLine width="w-5/6" height="h-4" />
                </div>

                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <SkCircle size="w-6 h-6" />
                      <SkLine width="w-full" height="h-4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {withFooter ? (
            <div className="mt-2 flex justify-end border-t border-dashed border-border px-6 py-6 lg:px-8">
              <SkLine width="w-40" height="h-12" className="rounded-md" />
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
