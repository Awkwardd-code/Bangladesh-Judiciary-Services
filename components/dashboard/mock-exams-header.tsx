import Link from "next/link";

export function MockExamsHeader() {
  return (
    <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
          Mock Exams
        </h1>
        <p className="mt-2 text-base text-muted">
          Practice under real exam conditions and track your progress.
        </p>
      </div>
      <Link
        href="/dashboard/results"
        className="inline-flex h-11 w-fit items-center rounded-md border border-border px-4 text-sm text-foreground hover:border-primary hover:text-primary lg:h-10"
      >
        View my results
      </Link>
    </header>
  );
}
