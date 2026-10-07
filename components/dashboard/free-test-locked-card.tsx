import Link from "next/link";
import { Lock } from "lucide-react";

export function FreeTestLockedCard() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-6 py-16">
      <div className="w-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex justify-center text-accent">
          <Lock className="h-12 w-12" />
        </div>

        <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
          You&apos;ve used all 10 free attempts.
        </h1>

        <p className="mt-3 text-sm text-muted">
          Enroll in a paid course to continue practicing with unlimited model tests.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/courses"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm text-cream hover:bg-primary-dark"
          >
            Browse courses
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border px-4 text-sm text-foreground hover:bg-muted/5"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
