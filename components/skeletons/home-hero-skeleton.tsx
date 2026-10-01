import {
  SkButton,
  SkLine,
  SkTitle,
  SkImage,
} from "@/components/skeletons/primitives";

export function HomeHeroSkeleton() {
  return (
    <section className="w-full bg-primary">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="order-2 flex flex-col lg:order-1 lg:col-span-7">
            <SkLine width="w-32" height="h-3" tone="copper" />
            <div className="mt-4 space-y-3">
              <SkTitle width="w-11/12" height="h-12" tone="dark" />
              <SkTitle width="w-8/12" height="h-12" tone="dark" />
            </div>
            <SkLine className="mt-5" width="w-64" height="h-4" tone="dark" />
            <div className="mt-8 flex flex-wrap gap-3">
              <SkButton width="w-40" height="h-11" tone="dark" />
              <SkButton width="w-44" height="h-11" tone="dark" />
            </div>
            <div className="mt-14 flex flex-wrap gap-6">
              <SkLine width="w-24" tone="dark" />
              <SkLine width="w-24" tone="dark" />
              <SkLine width="w-32" tone="dark" />
              <SkLine width="w-24" tone="dark" />
            </div>
          </div>
          <SkImage
            className="order-1 mx-auto max-w-[320px] sm:max-w-[360px] lg:order-2 lg:col-span-5 lg:ml-auto lg:max-w-[420px]"
            aspect="aspect-[4/5]"
            tone="dark"
          />
        </div>
      </div>
    </section>
  );
}
