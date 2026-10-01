import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { successStoriesCol } from "@/lib/collections";
import type {
  PublicSuccessStory,
  SuccessStory,
} from "@/lib/types/success-story";

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

async function findApprovedStory(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return (await successStoriesCol()).findOne({
    _id: new ObjectId(id),
    status: "approved",
  });
}

function toPublicStory(story: SuccessStory): PublicSuccessStory {
  const publicStory = { ...story };
  Reflect.deleteProperty(publicStory, "authorEmail");
  Reflect.deleteProperty(publicStory, "authorPhotoPublicId");
  Reflect.deleteProperty(publicStory, "reviewedBy");
  return publicStory;
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await findApprovedStory(id);

  if (!story) {
    return { title: "Success Story — BJS Prep" };
  }

  return {
    title: `${story.authorName} — Success Story — BJS Prep`,
    description: story.quote.slice(0, 150),
  };
}

export default async function SuccessStoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const storyRecord = await findApprovedStory(id);

  if (!storyRecord) {
    notFound();
  }

  const story = toPublicStory(storyRecord);
  const relatedRecords = await (
    await successStoriesCol()
  )
    .find({ status: "approved", _id: { $ne: storyRecord._id } })
    .sort({ isFeatured: -1, order: 1, createdAt: -1 })
    .limit(3)
    .toArray();
  const relatedStories = relatedRecords.map(toPublicStory);
  const paragraphs = (story.fullStory ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main>
      <section className="bg-cream px-6 py-16 lg:py-20">
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-3">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-md bg-primary/5 shadow-md lg:mx-0">
            {story.authorPhotoUrl ? (
              <Image
                src={story.authorPhotoUrl}
                alt={story.authorName}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-heading text-6xl font-bold text-accent">
                {story.authorName.trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              SUCCESS STORY
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
              {story.authorName}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-border text-muted">
                {story.authorUniversity}
              </Badge>
              <Badge className="border-border text-muted">
                {story.authorBatch}
              </Badge>
              {story.yearOfSelection ? (
                <Badge className="border-border text-muted">
                  Selected {story.yearOfSelection}
                </Badge>
              ) : null}
            </div>
            <Badge className="mt-6 border-accent px-4 py-2 text-sm text-accent">
              {story.achievement}
            </Badge>
            <blockquote className="relative mt-8 pl-10">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 font-heading text-5xl font-bold leading-none text-accent"
              >
                &quot;
              </span>
              <p className="font-heading text-xl font-semibold italic leading-snug text-primary lg:text-2xl">
                {story.quote}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {paragraphs.length > 0 ? (
        <section className="bg-cream px-6 pb-16">
          <div className="mx-auto max-w-3xl">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                className="mb-5 text-[17px] leading-8 text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {relatedStories.length > 0 ? (
        <section className="border-t border-border bg-cream px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-2xl font-bold text-primary">
              More stories
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedStories.map((related) => (
                <Card
                  key={related._id.toString()}
                  className="flex flex-col p-5"
                >
                  <p className="line-clamp-4 flex-1 text-sm leading-6 text-foreground">
                    “{related.quote}”
                  </p>
                  <p className="mt-4 text-sm font-semibold text-primary">
                    {related.authorName}
                  </p>
                  <Link
                    href={`/success-stories/${related._id.toString()}`}
                    className="mt-3 inline-flex min-h-9 cursor-pointer items-center text-sm text-accent hover:underline"
                  >
                    Read story →
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

    </main>
  );
}
