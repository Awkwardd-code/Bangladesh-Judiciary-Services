import type { PublicSuccessStory } from "@/lib/types/success-story";

export function SuccessStoriesHero({
  stories = [],
}: {
  stories?: PublicSuccessStory[];
}) {
  const selectionYears = stories
    .map((story) => story.yearOfSelection)
    .filter((year): year is number => typeof year === "number");
  const yearsOfStories =
    selectionYears.length > 0
      ? Math.max(...selectionYears) - Math.min(...selectionYears) + 1
      : 0;

  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          SUCCESS STORIES
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-primary lg:text-5xl">
          From preparation to the bench.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every story here began with the same exam you&apos;re preparing for.
          Read how they made it.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <StatPill value={stories.length} label="students featured" />
          <StatPill value={stories.length} label="judicial selections" />
          <StatPill value={yearsOfStories} label="years of stories" />
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-md border border-border bg-card px-4 py-3">
      <p className="font-heading text-xl font-bold text-primary">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
