"use client";

import { AlertTriangle, Landmark, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";

const methodOptions = [
  { value: "bkash", label: "bKash", icon: Wallet },
  { value: "nagad", label: "Nagad", icon: Wallet },
  { value: "bank", label: "Bank Transfer", icon: Landmark },
] as const;

const senderLabel: Record<string, string> = {
  bkash: "Your bKash number",
  nagad: "Your Nagad number",
  bank: "Your bank account number",
};

export function PaymentFormCard({
  course,
}: {
  course: {
    id: string;
    slug: string;
    title: string;
    price: number;
    currency: string;
  };
}) {
  const router = useRouter();
  const [method, setMethod] = useState<(typeof methodOptions)[number]["value"]>(
    "bkash",
  );
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidSender = useMemo(() => /^[0-9+\-\s]+$/.test(senderNumber.trim()), [senderNumber]);
  const isValidTransaction = useMemo(
    () => /^[A-Za-z0-9\-]+$/.test(transactionId.trim()) && transactionId.trim().length >= 4,
    [transactionId],
  );

  const isSubmitDisabled =
    loading ||
    !method ||
    senderNumber.trim().length < 6 ||
    !isValidSender ||
    !isValidTransaction;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitDisabled) {
      setError("Please complete all required payment details correctly.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${course.slug}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          method,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to submit payment details.");
      }

      router.push(`/courses/${course.slug}/purchase-pending`);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit payment details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-cream pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <Card className="mt-8 border border-border bg-card p-6 shadow-sm lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Amount to send
                </p>
              </div>
              <div className="font-heading text-2xl font-bold text-primary">
                {course.currency} {course.price.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-primary">
                Payment method
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                {methodOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = method === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMethod(option.value)}
                      className={[
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-transparent text-primary hover:bg-primary/[0.03]",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                      <span className="font-sans text-[14px] font-semibold">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="senderNumber" className="block text-sm font-medium text-primary">
                {senderLabel[method]}
              </label>
              <input
                id="senderNumber"
                value={senderNumber}
                onChange={(event) => setSenderNumber(event.target.value)}
                placeholder="01XXXXXXXXX"
                className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="transactionId" className="block text-sm font-medium text-primary">
                Transaction ID
              </label>
              <input
                id="transactionId"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="e.g. BKH8X4Y2Z1"
                className="h-12 w-full rounded-md border border-border bg-white px-3 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-primary">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Add any helpful details for verification."
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit payment details"
              )}
            </button>

            <p className="text-center text-xs text-muted">
              Your access will be activated after we verify the transaction. This
              usually takes less than 24 hours.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
