import { MaterialCard } from "@/components/dashboard/material-card";
import type { CourseMaterialPreview } from "@/components/courses/course-detail-types";

export function CourseMaterialsPreview({
  materials,
  hasAccess,
}: {
  materials: CourseMaterialPreview[];
  hasAccess: boolean;
}) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream py-8">
      <h2 className="font-heading text-2xl font-bold text-primary">
        Sample materials
      </h2>
      <p className="mt-2 text-sm text-muted">
        Preview the study materials included with this course.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => {
          return (
            <MaterialCard
              key={material.id}
              material={{
                id: material.id,
                title: material.title,
                description: material.description,
                kind: material.kind,
                sizeBytes: material.sizeBytes,
                isFreePreview: material.isFreePreview,
              }}
              hasAccess={hasAccess}
            />
          );
        })}
      </div>
    </section>
  );
}
