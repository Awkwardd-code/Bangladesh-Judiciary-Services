import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { PublicMentor } from "@/lib/types/mentor";

export function AboutFaculty({ mentors }: { mentors: PublicMentor[] }) {
  if (!mentors.length) {
    return null;
  }

  return (
    <section className="border-t border-border bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            OUR FACULTY
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
            Taught by people who know the bench.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Judges, advocates, and legal academics who bring the practice of law
            into the classroom.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {mentors.map((mentor) => (
            <Card
              key={mentor._id.toString()}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={mentor.photoUrl}
                  alt={mentor.name}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <p className="font-heading text-base font-semibold text-primary">
                  {mentor.name}
                </p>
                <p className="mt-1 text-[13px] text-muted line-clamp-1">
                  {mentor.title}
                </p>
                <Link
                  href={`/mentors/${mentor._id.toString()}`}
                  className="mt-3 inline-block cursor-pointer text-sm text-accent hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/mentors"
            className="cursor-pointer text-sm text-accent hover:underline"
          >
            Meet all mentors →
          </Link>
        </div>
      </div>
    </section>
  );
}
