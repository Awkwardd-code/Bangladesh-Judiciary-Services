"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { CourseDetail } from "@/components/courses/course-detail-types";

export function CourseCurriculum({ course }: { course: CourseDetail }) {
  const modules = [...course.modules].sort((left, right) => left.order - right.order);
  const [openModule, setOpenModule] = useState<number | null>(
    modules.length > 0 ? 0 : null,
  );
  const totalHours = modules.reduce(
    (sum, module) => sum + module.estimatedHours,
    0,
  );

  return (
    <section className="bg-cream py-8">
      <h2 className="font-heading text-2xl font-bold text-primary">
        Curriculum
      </h2>
      <p className="mt-2 text-sm text-muted">
        {modules.length} modules · {totalHours} total hours
      </p>

      {modules.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
          Curriculum will be published soon.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          {modules.map((module, index) => {
            const isOpen = openModule === index;
            const panelId = `course-module-${index}`;

            return (
              <article
                key={`${module.order}-${module.title}`}
                className="border-b border-border bg-card last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenModule(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-primary/[0.02]"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-cream">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-primary">
                        {module.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {module.estimatedHours} hours
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    size={18}
                    className={`shrink-0 text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div id={panelId} className="px-5 pb-5 pl-[4.25rem]">
                    <p className="text-sm leading-7 text-muted">
                      {module.description}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
