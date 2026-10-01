import Link from "next/link";
import { Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PublicSuccessStory } from "@/lib/types/success-story";

export function SuccessStoriesPreview({
  stories,
}: {
  stories: PublicSuccessStory[];
}) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Student stories
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-primary lg:text-4xl">
              From preparation to the bench
            </h2>
          </div>
          <Link
            href="/success-stories"
            className="inline-flex min-h-9 cursor-pointer items-center text-sm text-accent hover:underline"
          >
            Read all stories{" "}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stories.map((story) => (
            <Card
              key={story._id.toString()}
              className="flex flex-col p-5 shadow-sm"
            >
              <Quote aria-hidden="true" size={22} className="text-accent" />
              <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-foreground">
                {story.quote}
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-primary">
                  {story.authorName}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {story.authorUniversity} · {story.authorBatch}
                </p>
              </div>
              <Link
                href={`/success-stories/${story._id.toString()}`}
                className="mt-3 inline-flex min-h-9 cursor-pointer items-center text-sm text-accent hover:underline"
              >
                Read story{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
