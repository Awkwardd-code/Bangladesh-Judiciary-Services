import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PublicMentor } from "@/lib/types/mentor";

export function MentorsGrid({
  mentors,
  compact = false,
}: {
  mentors: PublicMentor[];
  compact?: boolean;
}) {
  return (
    <section className={`bg-cream px-4 sm:px-6 ${compact ? "py-8" : "py-12 pb-20"}`}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              BJS Prep Faculty
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-primary">
              Meet the mentors
            </h2>
          </div>
          {compact ? (
            <Link
              href="/mentors"
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              View all mentors
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </header>

        {mentors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
            <Users aria-hidden="true" className="mx-auto text-muted" size={34} />
            <p className="mt-3 text-sm text-muted">
              Mentor profiles are being prepared.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-10 cursor-pointer items-center text-sm font-medium text-accent hover:underline"
            >
              Contact us
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <article
                key={mentor._id.toString()}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/mentors/${mentor._id.toString()}`}
                  aria-label={`View ${mentor.name}'s profile`}
                  className="block aspect-[4/5] cursor-pointer overflow-hidden bg-primary/5"
                >
                  <Image
                    src={mentor.photoUrl}
                    alt={mentor.name}
                    width={720}
                    height={900}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </Link>
                <div className="p-5 sm:p-6">
                  <h3 className="font-heading text-lg font-semibold text-primary">
                    {mentor.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{mentor.title}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.specializations.map((specialization) => (
                      <Badge
                        key={specialization}
                        className="border-accent/50 px-2.5 py-1 text-xs text-accent"
                      >
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
                    {mentor.bio}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="text-xs text-muted">
                      {mentor.yearsOfExperience} years experience
                    </span>
                    <Link
                      href={`/mentors/${mentor._id.toString()}`}
                      className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm font-medium text-accent hover:underline"
                    >
                      View profile
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}