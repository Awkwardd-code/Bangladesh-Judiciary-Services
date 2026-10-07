"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  CourseAccess,
  CourseDetail,
} from "@/components/courses/course-detail-types";
import { Button } from "@/components/ui/button";

export function CourseSidebar({
  course,
  isLoggedIn,
  access: initialAccess,
}: {
  course: CourseDetail;
  isLoggedIn: boolean;
  access: CourseAccess | null;
}) {
  const router = useRouter();
  const [access, setAccess] = useState(initialAccess);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const discountedPrice =
    course.price * (1 - (course.discountPercent ?? 0) / 100);
  const hasDiscount =
    (course.discountPercent ?? 0) > 0 && course.price > 0;

  async function handleEnroll() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${course.slug}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id }),
      });
      const payload = await response.json();

      if (response.status === 409) {
        if (
          typeof payload?.error === "string" &&
          payload.error.toLowerCase().includes("already enrolled")
        ) {
          const accessResponse = await fetch(`/api/courses/${course.slug}`, {
            cache: "no-store",
          });
          const accessPayload = await accessResponse.json();

          if (!accessResponse.ok) {
            throw new Error(
              accessPayload?.error ?? "Unable to refresh course access.",
            );
          }

          setAccess(accessPayload?.data?.access ?? null);
          return;
        }

        throw new Error(payload?.error ?? "Unable to enroll in this course.");
      }

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to enroll in this course.");
      }

      const status = payload?.data?.status;

      if (status === "approved") {
        router.push(`/dashboard/courses/${course.slug}`);
        return;
      }

      if (status === "pending") {
        router.push(`/courses/${course.slug}/purchase-pending`);
        return;
      }

      throw new Error("Unable to confirm your enrollment.");
    } catch (enrollError) {
      setError(
        enrollError instanceof Error
          ? enrollError.message
          : "Unable to enroll in this course.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {hasDiscount ? (
            <>
              <span className="text-sm text-muted line-through">
                {course.currency} {course.price.toLocaleString()}
              </span>
              <span className="font-heading text-3xl font-bold text-primary">
                {course.currency} {Math.round(discountedPrice).toLocaleString()}
              </span>
              <span className="rounded-full border border-accent/40 px-2.5 py-1 text-xs font-semibold text-accent">
                -{course.discountPercent}%
              </span>
            </>
          ) : course.price === 0 ? (
            <span className="rounded-full border border-accent/40 px-3 py-1 text-sm font-semibold text-accent">
              Free
            </span>
          ) : (
            <span className="font-heading text-3xl font-bold text-primary">
              {course.currency} {course.price.toLocaleString()}
            </span>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {!isLoggedIn ? (
            <Button
              href={`/login?next=/courses/${course.slug}`}
              className="h-12 w-full rounded-md"
            >
              Login to enroll
            </Button>
          ) : access?.reason === "approved" ? (
            <Button
              href={`/dashboard/courses/${course.slug}`}
              className="h-12 w-full rounded-md"
            >
              Continue learning →
            </Button>
          ) : access?.reason === "pending" ? (
            <Button
              type="button"
              disabled
              className="h-12 w-full rounded-md border border-border bg-muted/10 text-muted"
            >
              Awaiting approval
            </Button>
          ) : access?.reason === "rejected" ? (
            <Button
              type="button"
              disabled
              className="h-12 w-full rounded-md border border-red-200 bg-red-50 text-red-700"
            >
              Access denied
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleEnroll()}
              disabled={loading}
              className="h-12 w-full rounded-md"
            >
              {loading ? (
                <>
                  <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll now"
              )}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {course.price > 0
            ? "Payment is verified manually. You'll be notified by email once your enrollment is approved."
            : "Free course — no payment required."}
        </p>

        <ul className="mt-6 space-y-3 border-t border-border pt-5">
          <FeatureRow label="Full lifetime access" />
          <FeatureRow label={`${course.totalClasses} live classes`} />
          <FeatureRow label={`${course.totalMockTests} model tests`} />
          <FeatureRow label={`${course.totalMaterials} study materials`} />
          <FeatureRow label="Mentor support" />
        </ul>
      </div>
    </aside>
  );
}

function FeatureRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-foreground">
      <CheckCircle2
        aria-hidden="true"
        size={16}
        className="shrink-0 text-accent"
      />
      {label}
    </li>
  );
}
