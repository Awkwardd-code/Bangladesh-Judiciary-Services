import { Card } from "@/components/ui/card";
import type { PublicSuccessStory } from "@/lib/types/success-story";

export function Testimonials({ stories = [] }: { stories?: PublicSuccessStory[] }) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-cream py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="text-center">
          <h2 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Hear from our learners
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            First-hand perspectives from learners working toward the bench.
          </p>
        </header>

        <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stories.map((story) => (
            <Card
              key={story._id.toString()}
              className="min-w-[320px] max-w-[380px] shrink-0 snap-start p-6"
            >
              <span
                aria-hidden="true"
                className="select-none font-heading text-4xl leading-none text-accent"
              >
                &quot;
              </span>
              <p className="mt-2 text-[15px] leading-7 text-foreground">
                {story.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
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
                    {story.authorUniversity}
                  </p>
                </div>
              </div>
            </Card>
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