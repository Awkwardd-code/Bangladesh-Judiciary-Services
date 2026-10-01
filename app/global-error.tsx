"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-cream">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto text-accent" size={48} />
            <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
              Application error.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              A critical error occurred. Please refresh the page.
            </p>
            <Button
              type="button"
              onClick={reset}
              className="mt-6 rounded-md bg-primary px-6 text-cream hover:bg-primary-dark"
            >
              Reload
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
