"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto text-accent" size={48} />
        <h1 className="mt-6 font-heading text-3xl font-bold text-primary lg:text-4xl">
          Something went wrong.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          An unexpected error occurred. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={reset}
            className="
              h-11 w-full rounded-md bg-primary px-6 text-cream
              hover:bg-primary-dark sm:w-auto
            "
          >
            Try again
          </Button>
          <Link
            href="/"
            className="
              inline-flex h-11 w-full items-center justify-center rounded-md
              border border-border px-6 text-sm font-medium text-foreground
              hover:border-primary hover:text-primary sm:w-auto
            "
          >
            Go home
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-6 max-w-full overflow-x-auto rounded-md bg-primary/5 p-4 text-left text-xs text-muted">
            {error.message}
          </pre>
        )}
      </div>
    </main>
  );
}
