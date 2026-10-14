import type { PublicSuccessStory } from "@/lib/types/success-story";

export function SuccessStoriesHero({
  stories = [],
}: {
  stories?: PublicSuccessStory[];
}) {
  const verifiedStories = stories.filter((story) => !story.isSample);
  const sampleCount = stories.filter((story) => story.isSample).length;
  const selectionYears = verifiedStories
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
          {verifiedStories.length > 0
            ? "From preparation to the bench."
            : "Explore sample journeys."}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {verifiedStories.length > 0
            ? "Read verified student experiences from people who prepared for the same exam you are working toward."
            : "Use these fictional examples to see how learner stories are presented."}
        </p>

        {verifiedStories.length > 0 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <StatPill value={verifiedStories.length} label="verified stories" />
            <StatPill
              value={
                verifiedStories.filter((story) => story.yearOfSelection).length
              }
              label="verified selections"
            />
            <StatPill value={yearsOfStories} label="years represented" />
          </div>
        ) : null}
        {sampleCount > 0 ? (
          <p className="mx-auto mt-8 inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950">
            {sampleCount} fictional demo{" "}
            {sampleCount === 1 ? "story" : "stories"} · not real student
            outcomes
          </p>
        ) : null}
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
