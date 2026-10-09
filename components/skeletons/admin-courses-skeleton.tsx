import {
  SkBadge,
  SkButton,
  SkImage,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function AdminCoursesSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <SkTitle width="w-40" height="h-9" />
          <SkLine width="w-56" />
        </div>
        <SkButton width="w-36" height="h-11" />
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <article
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <SkImage className="h-full rounded-none" />
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <SkBadge />
                <SkBadge width="w-24" />
              </div>
              <div className="space-y-2">
                <SkTitle width="w-3/4" />
                <SkLine width="w-5/6" />
              </div>
              <SkLine width="w-1/3" />
              <div className="flex items-center justify-between gap-3">
                <SkButton width="w-20" height="h-10" />
                <SkButton width="w-20" height="h-10" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
