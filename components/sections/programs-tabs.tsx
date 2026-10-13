"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Landmark, Scale } from "lucide-react";

import { ProgramCard } from "@/components/sections/program-card";
import { PROGRAMS, type ProgramMeta } from "@/lib/program-meta";

const programIcons = {
  BJS: Scale,
  BAR: Landmark,
  LLB: GraduationCap,
} satisfies Record<ProgramMeta["code"], typeof Scale>;

type SerializedCourse = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl?: string;
  category: ProgramMeta["code"];
  programKind?: "course" | "exam";
  type: "free" | "paid";
  price: number;
  durationLabel: string;
  totalClasses: number;
  totalMockTests: number;
};

export function ProgramsTabs({
  activeCode,
  courses,
}: {
  activeCode: ProgramMeta["code"];
  courses: SerializedCourse[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeProgram =
    PROGRAMS.find((program) => program.code === activeCode) ?? PROGRAMS[0];

  return (
    <section className="bg-cream px-6 pb-20">
      <div className="mx-auto max-w-6xl">
        <div
          aria-label="Choose a program"
          className="mt-8 flex justify-center"
          role="tablist"
        >
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {PROGRAMS.map((program) => {
              const Icon = programIcons[program.code];
              const isActive = program.code === activeCode;

              return (
                <button
                  key={program.code}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="program-panel"
                  id={`program-tab-${program.code}`}
                  onClick={() => router.push(`${pathname}?code=${program.code}`)}
                  className={`
                    inline-flex cursor-pointer items-center gap-2 rounded-full
                    px-6 py-2.5 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-primary text-cream"
                        : "text-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon size={16} />
                  {program.code}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10" id="program-panel" role="tabpanel">
          <ProgramCard program={activeProgram} ctaHref={`/programs?code=${activeProgram.code}`} />
        </div>

        <div className="mt-12">
          <div className="mb-5">
            <h2 className="font-heading text-xl font-semibold text-primary">
              Courses in {activeProgram.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Courses and model test batches available in this program.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <BookOpen className="mx-auto text-muted" size={40} />
              <h3 className="mt-4 text-base font-medium text-primary">
                No courses in this program yet.
              </h3>
              <p className="mt-1 text-sm text-muted">
                Check back soon for new live courses.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course.slug}`}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow group-hover:shadow-lg">
                    <div className="relative aspect-[16/10] overflow-hidden bg-primary/5">
                      {course.coverUrl ? (
                        <Image
                          src={course.coverUrl}
                          alt={course.title}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/5 text-sm font-medium text-muted">
                          No image
                        </div>
                      )}
                      <span className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/70 bg-card/95 px-2.5 py-1 text-[10px] font-medium text-primary">
                          {course.category}
                        </span>
                        <span className="rounded-full border border-white/70 bg-card/95 px-2.5 py-1 text-[10px] font-medium text-primary">
                          {course.programKind === "exam"
                            ? "Model test batch"
                            : "Course"}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span
                          className={
                            course.type === "free"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                              : "rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary"
                          }
                        >
                          {course.type === "free" ? "Free" : `BDT ${course.price.toLocaleString()}`}
                        </span>
                      </div>

                      <h3 className="font-heading text-[16px] font-semibold text-primary line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-6 text-muted line-clamp-2">
                        {course.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted">
                          {course.durationLabel}
                        </span>
                        <span className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted">
                          {course.totalClasses} classes
                        </span>
                        <span className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted">
                          {course.totalMockTests} tests
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm font-medium">
                        <span className="text-primary">
                          {course.type === "free" ? "Free" : `BDT ${course.price.toLocaleString()}`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-accent">
                          View course
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
