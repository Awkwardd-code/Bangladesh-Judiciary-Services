import type { AboutShape } from "@/lib/types/about";

export function AboutHero({ about }: { about: AboutShape }) {
  const stats = Array.isArray(about.stats) ? about.stats.slice(0, 4) : [];

  return (
    <section className="bg-cream px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          {about.heroKicker || "Why BJS Prep"}
        </p>
        <h1 className="mt-4 max-w-3xl mx-auto font-heading text-4xl font-bold leading-tight text-primary lg:text-5xl">
          {about.heroTitle || "A smarter roadmap for judicial prep."}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted">
          {about.heroSubtitle ||
            "We combine structured guidance, realistic practice, and mentor-driven accountability so students can prepare with clarity instead of guesswork."}
        </p>

        {stats.length > 0 ? (
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {stats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`}>
                <p className="font-heading text-2xl font-bold text-primary lg:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[12px] uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
