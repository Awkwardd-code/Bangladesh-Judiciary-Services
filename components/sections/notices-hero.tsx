export function NoticesHero() {
  return (
    <section className="bg-cream px-4 py-12 text-center sm:px-6 md:py-20 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
          Notices
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl md:text-5xl lg:text-5xl">
          Announcements and updates.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted lg:text-lg lg:leading-8">
          Course schedules, exam dates, and platform updates will appear here.
        </p>
      </div>
    </section>
  );
}
