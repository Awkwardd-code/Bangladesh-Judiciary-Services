import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BriefcaseBusiness, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PublicMentor } from "@/lib/types/mentor";

type MentorAndCtaProps = {
  mentor: PublicMentor | null;
};

export function MentorAndCta({ mentor }: MentorAndCtaProps) {
  return (
    <section className="bg-cream px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-stretch gap-4 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 -z-10 size-64 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative mx-auto h-40 w-32 shrink-0 overflow-hidden rounded-2xl bg-primary/10 shadow-md sm:mx-0 sm:h-44 sm:w-36">
              <Image
                src={mentor?.photoUrl || "/mentor.jpeg"}
                alt={
                  mentor?.name
                    ? `Portrait of ${mentor.name}`
                    : "LegalPath Bangladesh mentor"
                }
                fill
                unoptimized
                sizes="(max-width: 640px) 128px, 144px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <span className="h-px w-5 bg-accent" />
                Meet your mentor
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold text-primary">
                {mentor?.name ?? "Learn with experienced mentors"}
              </h2>
              {mentor ? (
                <>
                  <p className="mt-1 text-sm font-medium text-muted">
                    {mentor.title}
                  </p>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted">
                    {mentor.bio}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.yearsOfExperience > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted">
                        <BriefcaseBusiness size={13} className="text-accent" />
                        {mentor.yearsOfExperience}+ years experience
                      </span>
                    ) : null}
                    {mentor.specializations
                      .slice(0, 2)
                      .map((specialization) => (
                        <span
                          key={specialization}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted"
                        >
                          <Award size={13} className="text-accent" />
                          {specialization}
                        </span>
                      ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
                  Learn through a focused curriculum and practical preparation
                  designed for your legal studies and competitive exams.
                </p>
              )}
            </div>
          </div>
          <Link
            href="/mentors"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
          >
            Meet the mentors{" "}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Card>

        <Card className="relative isolate flex flex-col justify-between overflow-hidden rounded-2xl border-0 bg-primary p-5 text-cream shadow-lg sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-20 -z-10 size-72 rounded-full bg-accent/20 blur-3xl"
          />
          <div>
            <span className="flex size-12 items-center justify-center rounded-xl border border-cream/15 bg-cream/10 text-accent">
              <UserRound size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-heading text-2xl font-bold text-cream lg:text-3xl">
              Take the next step in your preparation
            </h2>
            <p className="mt-3 text-sm leading-6 text-cream/70">
              Explore courses and model test batches, choose your path, and keep
              your learning moving forward.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="group inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-soft px-5 text-sm font-bold text-primary-dark hover:bg-accent-soft/90 sm:w-fit"
            >
              Explore courses{" "}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/exam-courses"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-cream/20 px-5 text-sm font-semibold text-cream hover:bg-cream/10 sm:w-fit"
            >
              Model tests
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
