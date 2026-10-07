import Link from "next/link";

import { MaterialCard, type MaterialSummary } from "@/components/dashboard/material-card";

export type MaterialGroup = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  hasAccess: boolean;
  materials: MaterialSummary[];
};

export function MaterialsList({ grouped }: { grouped: MaterialGroup[] }) {
  if (grouped.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
        No course materials are available yet.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {grouped.map((group) => (
        <section key={group.courseId} className="space-y-4">
          <header className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-primary">
              {group.courseTitle}
            </h2>
            <Link
              href={`/dashboard/courses/${group.courseSlug}`}
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              View course →
            </Link>
          </header>
          {group.materials.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card p-5 text-sm text-muted">
              No materials for this course yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.materials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  hasAccess={group.hasAccess}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
