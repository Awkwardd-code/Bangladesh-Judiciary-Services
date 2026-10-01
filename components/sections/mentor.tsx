export function Mentor() {
  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[2fr_3fr] lg:gap-12">
        <div className="relative mx-auto flex aspect-[4/5] w-full max-w-sm items-end justify-center overflow-hidden rounded-lg bg-primary-dark shadow-md sm:max-w-md lg:max-w-none">
          <span className="absolute left-0 top-8 h-24 w-1 bg-accent" />
          <div className="mb-10 w-3/4 rounded-t-[45%] border-8 border-primary/80 bg-primary/40 px-4 pb-8 pt-16 text-center">
            <span className="font-heading text-4xl font-bold text-cream/80">
              BJS
            </span>
            <p className="mt-2 text-xs uppercase tracking-widest text-accent">
              Mentor portrait
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
            The mentor
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-primary">
            Name Professor
          </h2>
          <div className="mt-6 max-w-prose space-y-4 text-base leading-7 text-muted">
            <p>
              Professor is a distinguished scholar of Bangladeshi Judicial
              Service exam.
            </p>
            <p>
              Professor is a former professor and researcher in Bangladeshi
              Judicial Service exam.
            </p>
          </div>
          <blockquote className="relative mt-8 pl-10 font-heading text-xl font-semibold italic text-primary">
            <span className="absolute left-0 top-0 text-6xl font-bold leading-none text-accent">
              &quot;
            </span>
            These few professors and proctor education to make on the part of
            the preparation.
          </blockquote>
        </div>
      </div>
    </section>
  );
}
