import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PurchasePendingCard({
  course,
}: {
  course: { title: string; price: number };
}) {
  return (
    <section className="bg-cream py-20 lg:py-24">
      <div className="mx-auto max-w-2xl px-6">
        <Card className="border border-border bg-card p-8 text-center shadow-sm lg:p-10">
          <Clock size={48} className="mx-auto text-accent" />

          <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
            Payment submitted. Awaiting verification.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-center text-muted">
            We&apos;ve received your payment details for {course.title}. Our team
            will verify the transaction and activate your access.
          </p>

          <div className="mt-8 rounded-md border border-border bg-muted/5 p-5 text-left">
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-sm text-muted">Course</span>
              <span className="text-sm font-medium text-primary">
                {course.title}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border py-2">
              <span className="text-sm text-muted">Amount</span>
              <span className="text-sm font-medium text-primary">
                BDT {course.price.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border py-2">
              <span className="text-sm text-muted">Status</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                Pending review
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border py-2">
              <span className="text-sm text-muted">Expected activation</span>
              <span className="text-sm font-medium text-primary">
                Within 24 hours
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted">
            Didn&apos;t receive an email? Check spam or contact
            support@bjsprep.com with your transaction ID.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href="/dashboard"
              className="h-11 rounded-md border border-border bg-transparent text-primary"
            >
              Back to dashboard
            </Button>

            <Button
              href="/courses"
              className="h-11 rounded-md bg-primary text-white"
            >
              Browse more courses
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
