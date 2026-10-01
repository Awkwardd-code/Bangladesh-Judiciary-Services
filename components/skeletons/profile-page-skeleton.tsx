import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkCircle,
  SkHeading,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="space-y-2">
        <SkHeading width="w-40" />
        <SkLine width="w-64" />
      </header>
      <Card className="mt-6 border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <SkCircle size="w-24 h-24" />
          <div className="flex-1 space-y-3 text-center lg:text-left">
            <SkTitle className="mx-auto lg:mx-0" width="w-48" height="h-7" />
            <SkLine className="mx-auto lg:mx-0" width="w-56" />
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              <SkBadge width="w-32" />
              <SkBadge width="w-28" />
            </div>
            <SkLine className="mx-auto lg:mx-0" width="w-40" />
          </div>
          <div className="flex gap-2">
            <SkButton width="w-24" />
            <SkButton width="w-24" />
          </div>
        </div>
      </Card>
      <Card className="mt-6 border-border bg-card p-6 shadow-sm lg:p-8">
        <div className="flex items-center justify-between">
          <SkTitle width="w-48" />
          <SkButton width="w-20" />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkLine width="w-24" />
              <SkLine height="h-10" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-6 border-border bg-card p-6 shadow-sm lg:p-8">
        <SkHeading width="w-40" height="h-6" />
        <SkLine className="mt-3" width="w-2/3" />
        <SkButton className="mt-5" width="w-32" />
      </Card>
      <Card className="mt-6 border-border bg-card p-6 shadow-sm lg:p-8">
        <SkHeading width="w-32" height="h-6" tone="copper" />
        <SkLine className="mt-3" width="w-2/3" />
        <SkButton className="mt-5" width="w-32" tone="copper" />
      </Card>
    </div>
  );
}
