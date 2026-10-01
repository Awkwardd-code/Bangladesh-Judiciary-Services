import Image from "next/image";
import Link from "next/link";
import { Quote, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PublicSuccessStory } from "@/lib/types/success-story";

export function SuccessStoriesGrid({
  stories,
}: {
  stories: PublicSuccessStory[];
}) {
  if (stories.length === 0) {
    return (
      <section className="bg-cream px-6 py-12 pb-20">
        <div className="mx-auto max-w-6xl">
          <Card className="p-12 text-center">
            <Sparkles
              aria-hidden="true"
              size={40}
              className="mx-auto text-muted"
            />
            <h2 className="mt-4 text-lg font-medium text-primary">
              Stories are being collected.
            </h2>
            <p className="mt-1 text-sm text-muted">
              Approved success stories will appear here soon.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream px-6 py-12 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story._id.toString()} className="relative">
              {story.isFeatured ? (
                <Badge className="absolute right-3 top-3 z-10 border-accent bg-card text-accent">
                  FEATURED
                </Badge>
              ) : null}
              <Card className="flex h-full flex-col overflow-hidden border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] bg-primary/5">
                  {story.authorPhotoUrl ? (
                    <Image
                      src={story.authorPhotoUrl}
                      alt={story.authorName}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-accent">
                      <Quote aria-hidden="true" size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <Quote aria-hidden="true" size={24} className="text-accent" />
                  <p className="mt-2 line-clamp-4 text-[15px] leading-7 text-foreground">
                    {story.quote}
                  </p>

                  <div className="mt-auto border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-cream"
                      >
                        {getInitials(story.authorName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-primary">
                          {story.authorName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {story.authorUniversity} · {story.authorBatch}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge className="max-w-[60%] truncate border-accent text-xs text-accent">
                        {story.achievement}
                      </Badge>
                      <Link
                        href={`/success-stories/${story._id.toString()}`}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm text-accent hover:underline"
                      >
                        Read full story
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
