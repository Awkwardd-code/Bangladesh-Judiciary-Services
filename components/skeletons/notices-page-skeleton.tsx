import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function NoticesPageSkeleton() {
  return (
    <main>
      <section className="bg-cream px-4 py-12 text-center sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <SkLine className="mx-auto" width="w-24" />
          <SkHeading className="mx-auto" width="w-2/3" />
          <SkLine className="mx-auto" width="w-5/6" />
        </div>
      </section>
      <section className="bg-cream px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {Array.from({ length: 6 }, (_, index) => (
            <Card
              key={index}
              className="mb-4 border-border bg-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <SkBadge width="w-20" />
                <SkLine width="w-24" />
              </div>
              <SkTitle className="mt-3" width="w-3/4" />
              <SkLine className="mt-2" />
              <SkLine className="mt-2" width="w-5/6" />
              <div className="mt-4 flex justify-end">
                <SkLine width="w-20" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
