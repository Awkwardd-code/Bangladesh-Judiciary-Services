import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";

import { Badge } from "@/components/ui/badge";
import { mentorsCol } from "@/lib/collections";

type MentorPageProps = {
  params: Promise<{ id: string }>;
};

async function findPublishedMentor(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return (await mentorsCol()).findOne({
    _id: new ObjectId(id),
    isPublished: true,
  });
}

export async function generateMetadata({ params }: MentorPageProps): Promise<Metadata> {
  const { id } = await params;
  const mentor = await findPublishedMentor(id);

  if (!mentor) {
    return { title: "Mentor — BJS Prep" };
  }

  const description =
    mentor.bio.length > 160 ? `${mentor.bio.slice(0, 157)}...` : mentor.bio;

  return {
    title: `${mentor.name} — BJS Prep`,
    description,
  };
}

export default async function MentorProfilePage({ params }: MentorPageProps) {
  const { id } = await params;
  const mentor = await findPublishedMentor(id);

  if (!mentor) {
    notFound();
  }

  return (
    <main>
      <section className="bg-cream px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-center md:gap-12">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-lg border border-border bg-primary/5">
            <Image
              src={mentor.photoUrl}
              alt={mentor.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Faculty mentor
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
              {mentor.name}
            </h1>
            <p className="mt-2 text-base text-muted">{mentor.title}</p>
            <p className="mt-5 text-sm text-muted">
              {mentor.yearsOfExperience} years experience
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-prose">
          <h2 className="font-heading text-2xl font-bold text-primary">
            About {mentor.name}
          </h2>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted">
            {mentor.bio}
          </p>
          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            Areas of focus
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {mentor.specializations.map((specialization) => (
              <Badge
                key={specialization}
                className="border-accent/50 px-3 py-1.5 text-sm text-accent"
              >
                {specialization}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}