import Link from "next/link";

export function CtaBand() {
  return (
    <section className="bg-primary-dark px-6 py-20 text-cream lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-3xl font-bold lg:text-4xl">
          Ready to begin your preparation?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-cream/75">
          Join students preparing for the Bangladesh Judicial Service exam.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-accent px-8 font-medium text-primary-dark hover:bg-accent/90"
          >
            Create Account
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-cream/20 px-8 font-medium text-cream hover:bg-cream/10"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
