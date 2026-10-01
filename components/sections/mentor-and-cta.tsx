import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { PublicMentor } from "@/lib/types/mentor";

type MentorAndCtaProps = {
  mentor: PublicMentor | null;
};

export function MentorAndCta({ mentor }: MentorAndCtaProps) {
  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md shadow-sm">
              <Image
                src="/lawyer.jpg"
                alt="Lawyer in formal attire"
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                THE MENTOR
              </p>
              <h2 className="mt-1 font-heading text-lg font-bold text-primary">
                {mentor?.name ?? "Name Professor"}
              </h2>
              <p className="mt-1 text-[13px] text-muted">
                {mentor?.title ??
                  "Professor in a contemporary Bangladeshi Judicial Service exam."}
              </p>
              <p className="mt-2 line-clamp-3 text-[13px] text-muted">
                {mentor?.bio ??
                  "Professor in a contemporary Bangladeshi Judicial Service exam."}
              </p>
            </div>
          </div>

          <blockquote className="relative pl-8">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 font-heading text-3xl font-bold leading-none text-accent"
            >
              &quot;
            </span>
            <p className="font-heading text-base font-semibold italic leading-snug text-primary">
              These few professors and proctor education to make on the part of
              the preparation.
            </p>
          </blockquote>
        </Card>

        <Card className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 text-foreground shadow-sm">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary lg:text-3xl">
              Ready to begin your preparation?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Ready to begin your preparation? Check your preparation.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-9 cursor-pointer items-center rounded-md bg-accent px-4 text-sm font-semibold text-[#0A1428] hover:bg-accent/90"
            >
              Create Account
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-9 cursor-pointer items-center rounded-md px-4 text-sm text-primary hover:underline"
            >
              Browse Courses
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
