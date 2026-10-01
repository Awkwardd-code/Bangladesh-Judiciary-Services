import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PublicSuccessStory } from "@/lib/types/success-story";

export function AboutStories({ stories }: { stories: PublicSuccessStory[] }) {
  if (!stories.length) {
    return null;
  }

  return (
    <section className="border-t border-border bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            SUCCESS STORIES
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-primary lg:text-4xl">
            From preparation to the bench.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Real journeys from students who cleared the exam.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {stories.map((story) => {
            const initials = story.authorName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("");

            return (
              <Card
                key={story._id.toString()}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <p className="select-none font-heading text-3xl leading-none text-accent">
                  “
                </p>
                <p className="mt-2 text-[15px] leading-7 text-foreground line-clamp-4">
                  {story.quote}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-cream">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-primary">
                      {story.authorName}
                    </p>
                    <p className="text-[12px] text-muted">
                      {story.authorUniversity} · {story.authorBatch}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <Badge className="border border-accent bg-transparent text-[11px] text-accent">
                    {story.achievement}
                  </Badge>
                  <Link
                    href={`/success-stories/${story._id.toString()}`}
                    className="cursor-pointer text-sm text-accent hover:underline"
                  >
                    Read story →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/success-stories"
            className="cursor-pointer text-sm text-accent hover:underline"
          >
            Read all stories →
          </Link>
        </div>
      </div>
    </section>
  );
}
