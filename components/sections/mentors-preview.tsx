import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PublicMentor } from "@/lib/types/mentor";

export function MentorsPreview({ mentors = [] }: { mentors?: PublicMentor[] }) {
  if (mentors.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Our faculty
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
            Taught by people who know the bench.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Meet the legal educators who bring experience, clarity, and
            perspective to every lesson.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {mentors.map((mentor) => (
            <Card
              key={mentor._id.toString()}
              className="overflow-hidden shadow-sm"
            >
              <div className="relative aspect-[4/5] bg-primary/5">
                <Image
                  src={mentor.photoUrl}
                  alt={mentor.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-base font-semibold text-primary">
                  {mentor.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-[13px] text-muted">
                  {mentor.title}
                </p>
                <Link
                  href={`/mentors/${mentor._id.toString()}`}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
                >
                  View profile
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/mentors"
            className="inline-flex min-h-10 cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
          >
            Meet all mentors
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}