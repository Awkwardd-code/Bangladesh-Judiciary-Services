import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CourseMentor } from "@/components/courses/course-detail-types";

export function CourseMentors({ mentors }: { mentors: CourseMentor[] }) {
  if (mentors.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream py-8">
      <h2 className="font-heading text-2xl font-bold text-primary">
        Meet your mentors
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card
            key={mentor.id}
            className="flex items-start gap-4 border-border p-5"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary/10">
              <Image
                src={mentor.photoUrl ?? "/mentor.jpg"}
                alt={mentor.name}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-base font-semibold text-primary">
                {mentor.name}
              </h3>
              <p className="mt-1 text-[13px] text-muted">{mentor.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mentor.specializations.slice(0, 2).map((specialization) => (
                  <Badge
                    key={specialization}
                    className="px-2 py-1 text-xs text-muted"
                  >
                    {specialization}
                  </Badge>
                ))}
              </div>
              <Link
                href={`/mentors/${mentor.id}`}
                className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs text-accent hover:underline"
              >
                View profile
                <ArrowRight aria-hidden="true" size={13} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
