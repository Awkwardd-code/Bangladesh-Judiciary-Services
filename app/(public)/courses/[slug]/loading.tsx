import { Card } from "@/components/ui/card";
import {
  SkBadge,
  SkButton,
  SkHeading,
  SkImage,
  SkLine,
  SkTitle,
} from "@/components/skeletons/primitives";

export default function CourseDetailLoading() {
  return (
    <main className="bg-cream">
      <section className="px-4 pb-10 pt-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <SkBadge width="w-24" />
            <SkHeading className="mt-5" width="w-4/5" height="h-12" />
            <SkLine className="mt-4" />
            <SkLine className="mt-2" width="w-5/6" />
            <div className="mt-6 flex gap-2">
              <SkBadge width="w-28" />
              <SkBadge width="w-28" />
              <SkBadge width="w-28" />
            </div>
          </div>
          <SkImage aspect="h-64 lg:h-80" />
        </div>
      </section>
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <SkButton key={index} width="w-28" />
              ))}
            </div>
            <Card className="space-y-4 border-border p-6">
              <SkTitle width="w-1/3" />
              <SkLine />
              <SkLine />
              <SkLine width="w-5/6" />
            </Card>
          </div>
          <Card className="h-fit space-y-5 border-border p-6 lg:col-span-4">
            <SkHeading width="w-1/2" />
            <SkLine />
            <SkButton width="w-full" height="h-12" />
            <SkLine />
            <SkLine width="w-4/5" />
          </Card>
        </div>
      </section>
    </main>
  );
}
