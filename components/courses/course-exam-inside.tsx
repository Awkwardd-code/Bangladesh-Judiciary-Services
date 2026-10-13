import { CheckCircle2, Clock, Layers3 } from "lucide-react";

import type { CourseDetail } from "@/components/courses/course-detail-types";

export function CourseExamInside({ course }: { course: CourseDetail }) {
  const segments = [...course.segments].sort(
    (left, right) => left.order - right.order
  );

  return (
    <section className="py-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">
          Inside the course
        </h2>
        <p className="mt-2 text-sm text-muted">
          Course modules, included content, and individual segment pricing.
        </p>
      </div>
      {segments.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-sm text-muted">
          Course details will be published soon.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {segments.map((segment, index) => {
            const salePrice = segment.discountedPrice;
            const payablePrice = segment.isFree
              ? 0
              : (salePrice ?? segment.price ?? 0);

            return (
              <article
                key={segment._id}
                className="rounded-lg border border-border bg-card p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/5 text-sm font-semibold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {segment.title}
                      </h3>
                      {segment.description ? (
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {segment.description}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Layers3 size={14} />
                          {segment.subSegments.length} lessons and materials
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} />
                          Module {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    {segment.isFree ? (
                      <span className="font-semibold text-emerald-700">
                        Free
                      </span>
                    ) : (
                      <>
                        {salePrice !== undefined &&
                        salePrice < (segment.price ?? 0) ? (
                          <span className="mr-2 text-sm text-muted line-through">
                            BDT {(segment.price ?? 0).toLocaleString()}
                          </span>
                        ) : null}
                        <span className="font-heading text-xl font-bold text-primary">
                          BDT {payablePrice.toLocaleString()}
                        </span>
                      </>
                    )}
                    {segment.isFree ? (
                      <CheckCircle2
                        aria-label="Included free"
                        size={16}
                        className="mt-1 text-emerald-600 sm:ml-auto"
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
