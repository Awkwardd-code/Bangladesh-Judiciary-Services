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
    <section className="bg-background px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Learner stories
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary lg:text-4xl">
              Every journey starts with a step
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Read how learners are working toward their goals with focused
              preparation.
            </p>
          </div>
          <Link
            href="/success-stories"
            className="group inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-primary hover:border-primary/30"
          >
            Read all stories{" "}
            <span
              aria-hidden="true"
              className="text-accent transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stories.map((story) => (
            <Card
              key={story._id.toString()}
              className="group relative flex flex-col overflow-hidden rounded-2xl border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Quote aria-hidden="true" size={20} />
              </span>
              <p className="mt-5 line-clamp-4 flex-1 font-heading text-base leading-7 text-primary">
                {story.quote}
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-primary">{story.authorName}</p>
                <p className="mt-1 text-xs text-muted">
                  {story.authorUniversity} · {story.authorBatch}
                </p>
              </div>
              <Link
                href={`/success-stories/${story._id.toString()}`}
                className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm font-semibold text-primary group-hover:text-accent"
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
