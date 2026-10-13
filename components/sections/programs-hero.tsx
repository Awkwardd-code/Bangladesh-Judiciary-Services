export function ProgramsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-cream px-6 py-16 text-center lg:py-20">
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-28 -z-10 size-80 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-20 -z-10 size-96 rounded-full bg-primary/[0.06] blur-3xl"
      />
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex items-center rounded-full border border-accent/25 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent shadow-sm">
          Programs
        </p>
        <h1 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight text-primary lg:text-5xl">
          One platform.
          <span className="block text-accent">Three exam tracks.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Pick the program that matches your goal. Each track gives you live
          exams, mentor-graded writing, analytics, and a clear path to result
          day.
        </p>
      </div>
    </section>
  );
}
