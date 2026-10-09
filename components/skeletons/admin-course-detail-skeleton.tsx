import {
  SkBadge,
  SkButton,
  SkLine,
  SkSquare,
} from "@/components/skeletons/primitives";

export function AdminCourseDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid w-full max-w-3xl grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <SkButton key={index} width="w-full" />
        ))}
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          {["Title", "Slug"].map((field) => (
            <div key={field} className="space-y-2">
              <SkLine width="w-16" />
              <SkSquare className="w-full" size="h-11" rounded="md" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <SkLine width="w-24" />
          <SkSquare className="w-full" size="h-24" rounded="md" />
        </div>
        <div className="space-y-2">
          <SkLine width="w-32" />
          <SkSquare className="w-full" size="h-40" rounded="md" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkLine width="w-20" />
              <SkSquare className="w-full" size="h-11" rounded="md" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <SkBadge width="w-5" height="h-5" />
          <SkLine width="w-24" />
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur">
        <SkButton width="w-20" />
        <SkButton width="w-20" />
      </div>
    </div>
  );
}
