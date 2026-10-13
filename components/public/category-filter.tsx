"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { CourseCategory } from "@/lib/types/course";

const categoryLinks: Array<{ code: CourseCategory; label: string }> = [
  { code: "BJS", label: "BJS" },
  { code: "BAR", label: "BAR" },
  { code: "LLB", label: "LLB" },
];

export function CategoryFilter({ currentCode }: { currentCode: CourseCategory }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <section className="bg-cream px-6 pb-6 pt-2">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/courses"
            className={
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors " +
              (pathname === "/courses"
                ? "border-primary bg-primary text-cream"
                : "border-border bg-card text-foreground hover:bg-primary/5")
            }
          >
            All Programs
          </Link>

          {categoryLinks.map((category) => {
            const active = currentCode === category.code;

            return (
              <Link
                key={category.code}
                href={`/programs/${category.code}${query ? `?${query}` : ""}`}
                className={
                  "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors " +
                  (active
                    ? "border-primary bg-primary text-cream"
                    : "border-border bg-card text-foreground hover:bg-primary/5")
                }
              >
                {category.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
