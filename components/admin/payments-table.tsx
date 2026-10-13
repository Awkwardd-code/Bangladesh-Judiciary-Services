"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PaymentsFilter } from "@/components/admin/payments-filter";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { buildQuery } from "@/lib/query-params";

type Payment = {
  _id: string;
  transactionId: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: string;
  senderNumber: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export function PaymentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });
  const [pagination, setPagination] = useState(emptyPagination);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function reviewPayment(payment: Payment, action: "approve" | "reject") {
    if (reviewingId) return;
    if (
      action === "reject" &&
      !window.confirm(
        `Reject transaction ${payment.transactionId}? The student's course access will remain locked.`,
      )
    ) {
      return;
    }
    setReviewingId(payment._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/payments/${payment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to review this payment.");
      }
      setPayments((current) =>
        searchParams.get("status") === "pending"
          ? current.filter((item) => item._id !== payment._id)
          : current.map((item) =>
              item._id === payment._id
                ? {
                    ...item,
                    status: action === "approve" ? "completed" : "failed",
                  }
                : item,
            ),
      );
      setSummary((current) => ({
        ...current,
        pendingCount: Math.max(0, current.pendingCount - 1),
        completedCount:
          action === "approve"
            ? current.completedCount + 1
            : current.completedCount,
        failedCount:
          action === "reject" ? current.failedCount + 1 : current.failedCount,
        totalAmount:
          action === "approve"
            ? current.totalAmount + payment.amount
            : current.totalAmount,
      }));
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to review this payment.",
      );
    } finally {
      setReviewingId(null);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/admin/payments?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load payments.");
        }
        return result as {
          data?: {
            payments?: Payment[];
            summary?: typeof summary;
            pagination?: Pagination;
          };
        };
      })
      .then((result) => {
      setPayments(result.data?.payments ?? []);
      setSummary((current) => result.data?.summary ?? current);
      setPagination(result.data?.pagination ?? emptyPagination);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load payments.",
          );
        }
      });
    return () => controller.abort();
  }, [query]);

  function changePage(page: number) {
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, { page });
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  return (
    <>
      <PaymentsFilter />
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total revenue"
          value={`BDT ${summary.totalAmount.toLocaleString()}`}
        />
        <Metric label="Completed" value={summary.completedCount} />
        <Metric label="Pending" value={summary.pendingCount} />
        <Metric label="Failed" value={summary.failedCount} />
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden grid-cols-7 gap-4 border-b border-border p-4 text-xs uppercase text-muted md:grid">
          <span>Transaction / Course</span>
          <span>Student / Sender</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Date</span>
          <span>Review</span>
        </div>
        {payments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No payments recorded yet.
          </p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment._id}
              className="grid gap-2 border-b border-border p-4 last:border-0 md:grid-cols-7 md:items-center md:gap-4"
            >
              <span>
                <b className="block font-mono text-xs">{payment.transactionId}</b>
                <small className="text-muted">{payment.courseTitle}</small>
              </span>
              <span>
                <b className="block text-sm">{payment.userName}</b>
                <small className="block text-muted">{payment.userEmail}</small>
                <small className="block text-muted">{payment.senderNumber}</small>
                {payment.notes ? (
                  <small className="block text-muted">{payment.notes}</small>
                ) : null}
              </span>
              <span className="text-sm">
                BDT {payment.amount.toLocaleString()}
              </span>
              <span className="text-sm capitalize">{payment.method}</span>
              <Badge className="w-fit">{payment.status}</Badge>
              <span className="text-xs text-muted">
                {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                {payment.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void reviewPayment(payment, "approve")}
                      disabled={reviewingId !== null}
                      aria-label={`Approve payment ${payment.transactionId}`}
                      title="Approve and activate course access"
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void reviewPayment(payment, "reject")}
                      disabled={reviewingId !== null}
                      aria-label={`Reject payment ${payment.transactionId}`}
                      title="Reject payment"
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-muted">Reviewed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={changePage}
        />
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-4">
      <span className="absolute left-0 top-0 h-1 w-12 bg-accent" />
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-primary">
        {value}
      </p>
    </div>
  );
}
