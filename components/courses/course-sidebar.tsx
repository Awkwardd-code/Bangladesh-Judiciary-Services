"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import type { AccessInfo } from "@/components/courses/course-hero";
import type { Course } from "@/lib/types/course";

type PublicCourse = Pick<
  Course,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "coverUrl"
  | "category"
  | "price"
  | "durationLabel"
>;

export function CourseSidebar({
  course,
  access,
  isLoggedIn,
}: {
  course: PublicCourse;
  access: AccessInfo | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const purchase = async () => {
    if (loading) {
      return;
    }

    if (course.price > 0) {
      router.push(`/courses/${course.slug}/payment`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/courses/${course.slug}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course._id.toString(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to process enrollment.");
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

      throw new Error("Unable to process enrollment.");
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Unable to complete purchase.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <Card className="border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {course.price === 0 ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Free
            </span>
          ) : (
            <div>
              <p className="font-heading text-3xl font-bold text-primary">
                BDT {course.price.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted">One-time payment</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          {!isLoggedIn ? (
            <Button
              href={`/login?next=/courses/${course.slug}`}
              className="h-12 w-full rounded-md bg-primary text-white"
            >
              Login to enroll
            </Button>
          ) : access?.reason === "approved" ? (
            <Button
              href={`/dashboard/courses/${course.slug}`}
              className="h-12 w-full rounded-md bg-primary text-white"
            >
              Continue learning →
            </Button>
          ) : access?.reason === "pending" ? (
            <Button
              type="button"
              disabled
              className="h-12 w-full rounded-md border border-border bg-muted/20 text-muted"
            >
              Awaiting approval
            </Button>
          ) : access?.reason === "rejected" ? (
            <Button
              type="button"
              disabled
              className="h-12 w-full rounded-md border border-red-200 bg-red-50 text-red-700"
            >
              Enrollment rejected
            </Button>
          ) : (
            <Button
              type="button"
              onClick={purchase}
              disabled={loading}
              className="h-12 w-full rounded-md bg-primary text-white"
            >
              {loading ? "Processing..." : "Purchase this course"}
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Lifetime access</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Mentor-led video lessons</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Downloadable notes</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Model tests included</span>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] text-muted">
          Payment is verified manually. You&apos;ll be notified by email once
          your enrollment is approved.
        </p>
      </Card>
    </aside>
  );
}
