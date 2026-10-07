import type { CourseDetail } from "@/components/courses/course-detail-types";

export function CourseDescription({ course }: { course: CourseDetail }) {
  const description = course.longDescription.trim() || course.description;
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="bg-cream py-8">
      <h2 className="font-heading text-2xl font-bold text-primary">
        About this course
      </h2>

      <div className="mt-5">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className="mb-5 text-base leading-8 text-foreground last:mb-0"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
