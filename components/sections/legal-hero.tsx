type LegalHeroProps = {
  title: string;
  kicker: string;
  updated: string;
};

export function LegalHero({ title, kicker, updated }: LegalHeroProps) {
  return (
    <section className="bg-cream px-4 py-12 text-center sm:px-6 md:py-20 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
          {kicker}
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl md:text-5xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted">Last updated: {updated}</p>
      </div>
    </section>
  );
}
