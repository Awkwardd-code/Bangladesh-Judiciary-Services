import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { PublicMentor } from "@/lib/types/mentor";

export function MentorSection({
  mentor,
}: {
  mentor: PublicMentor | null;
}) {
  if (!mentor) {
    return null;
  }

  const bioParagraphs = mentor.bio
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <span
            aria-hidden="true"
            className="absolute left-0 top-8 z-10 h-24 w-1 bg-accent"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-md shadow-md">
            <Image
              src={mentor.photoUrl}
              alt={mentor.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            THE MENTOR
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
            {mentor.name}
          </h2>
          <p className="mt-1 text-[15px] text-muted">{mentor.title}</p>

          <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-muted">
            {(bioParagraphs.length > 0 ? bioParagraphs : [mentor.bio]).map(
              (paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ),
            )}
          </div>

          <blockquote className="relative mt-8 pl-10">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 font-heading text-5xl font-bold leading-none text-accent"
            >
              &quot;
            </span>
            <p className="font-heading text-2xl font-semibold italic leading-snug text-primary">
              Every principle of law exists to serve a purpose. Understanding
              that purpose is the real preparation.
            </p>
          </blockquote>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="border-accent text-xs text-accent">
              {mentor.yearsOfExperience}+ years teaching
            </Badge>
            {mentor.specializations[0] ? (
              <Badge className="border-accent text-xs text-accent">
                {mentor.specializations[0]}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}