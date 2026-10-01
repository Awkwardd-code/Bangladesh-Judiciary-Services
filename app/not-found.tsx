import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cream px-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-heading text-[180px] font-bold text-primary/[0.04]"
      >
        404
      </span>

      <div className="relative z-10 max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-primary lg:text-5xl">
          Page not found.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="
              inline-flex h-11 w-full items-center justify-center rounded-md
              bg-primary px-6 text-sm font-medium text-cream
              hover:bg-primary-dark sm:w-auto
            "
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="
              inline-flex h-11 w-full items-center justify-center rounded-md
              border border-border px-6 text-sm font-medium text-foreground
              hover:border-primary hover:text-primary sm:w-auto
            "
          >
            Browse courses
          </Link>
        </div>
      </div>
    </main>
  );
}
