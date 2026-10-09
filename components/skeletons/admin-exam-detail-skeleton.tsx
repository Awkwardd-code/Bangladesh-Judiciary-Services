import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

export function AdminExamDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <SkLine width="w-40" height="h-3" />

      <header
        className="
          mt-3 flex flex-col gap-4 border-b border-border bg-background/95 py-4
          sm:flex-row sm:items-end sm:justify-between
        "
      >
        <div className="space-y-3">
          <SkHeading width="w-80" height="h-8" />
          <SkLine width="w-64" height="h-4" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkButton key={index} width="w-28" height="h-10" />
          ))}
        </div>
      </header>

      <div className="mt-5 space-y-5">
        <nav
          aria-hidden="true"
          className="rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <ol className="grid gap-3 sm:grid-cols-5 sm:gap-0">
            {Array.from({ length: 5 }, (_, index) => (
              <li
                key={index}
                className="
                  relative flex items-center gap-3 sm:flex-col sm:gap-2
                "
              >
                {index < 4 ? (
                  <SkLine
                    width="w-full"
                    height="h-px"
                    className="absolute left-4 top-4 hidden sm:block"
                  />
                ) : null}
                <SkCircle size="w-8 h-8" className="relative z-10 shrink-0" />
                <SkLine width="w-20" height="h-3" />
              </li>
            ))}
          </ol>
        </nav>

        <Card className="space-y-4 border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <SkCircle size="w-6 h-6" />
            <SkLine width="w-32" height="h-4" />
          </div>
          <SkLine width="w-3/4" height="h-4" />
          <SkLine width="w-full" height="h-2" className="rounded-full" />
        </Card>

        <div className="flex gap-2 border-b border-border">
          {Array.from({ length: 3 }, (_, index) => (
            <SkLine
              key={index}
              width="w-24"
              height="h-10"
              className="rounded-md"
            />
          ))}
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SkLine width="w-32" height="h-5" />
            <SkLine width="w-48" height="h-4" />
          </div>

          {Array.from({ length: 5 }, (_, index) => (
            <Card key={index} className="space-y-4 border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SkCircle size="w-8 h-8" />
                  <div className="flex flex-wrap gap-2">
                    <SkBadge />
                    <SkBadge />
                    <SkBadge />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }, (_, actionIndex) => (
                    <SkButton key={actionIndex} width="w-6" height="h-6" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <SkLine width="w-full" height="h-4" />
                <SkLine width="w-5/6" height="h-4" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, optionIndex) => (
                  <SkSquare
                    key={optionIndex}
                    className="w-full"
                    size="h-12"
                    rounded="md"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <SkBadge width="w-20" height="h-5" />
                <SkBadge width="w-16" height="h-5" />
              </div>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
