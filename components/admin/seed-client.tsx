"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

type SeedResult = {
  courseId: string;
  segments: number;
  subSegments: number;
  exams: number;
  questions: number;
  skipped: boolean;
};

type SeedResponse = {
  data?: {
    result: SeedResult;
    message: string;
  };
  error?: string;
};

export function SeedClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSeed() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed/course", {
        method: "POST",
      });
      const payload = (await response.json()) as SeedResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to seed the course.");
      }

      setResult(payload.data.result);
      toast(payload.data.message);
    } catch (seedError) {
      const message =
        seedError instanceof Error
          ? seedError.message
          : "Unable to seed the course.";
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto mt-12 max-w-2xl border-border p-6 sm:p-8">
      <h1 className="font-heading text-2xl font-bold text-primary">
        Seed a starter course
      </h1>
      <p className="mt-2 text-muted">
        Creates a fully-formed free course called &apos;BJS Foundation —
        Complete 6-Month Program&apos; with 6 months, 24 sub-segments, 6 exams,
        and 240 questions. Idempotent — running twice does nothing the second
        time.
      </p>

      <div className="mt-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle
          aria-hidden="true"
          size={20}
          className="mt-0.5 shrink-0 text-amber-600"
        />
        <p>
          Only run this on a fresh database. If the course already exists, the
          seed skips.
        </p>
      </div>

      <Button
        type="button"
        onClick={() => void runSeed()}
        disabled={loading}
        className="mt-6 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 aria-hidden="true" size={16} className="animate-spin" />
            Seeding...
          </>
        ) : (
          "Seed course"
        )}
      </Button>

      {result ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              size={20}
              className="mt-0.5 shrink-0 text-emerald-700"
            />
            <div>
              <p className="font-semibold">
                {result.skipped ? "Seed already exists" : "Seed completed"}
              </p>
              <pre className="mt-3 overflow-x-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
              <Link
                href="/courses/bjs-foundation-complete"
                className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-emerald-800 hover:underline"
              >
                View the course
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}
    </Card>
  );
}
