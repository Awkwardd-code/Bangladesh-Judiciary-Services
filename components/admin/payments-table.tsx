"use client";

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
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
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
  useEffect(() => {
    void fetch(`/api/admin/payments?${query}`)
      .then((response) => response.json())
      .then(
        (result: {
          data?: {
            payments?: Payment[];
            summary?: typeof summary;
            pagination?: Pagination;
          };
        }) => {
          setPayments(result.data?.payments ?? []);
          setSummary((current) => result.data?.summary ?? current);
          setPagination(result.data?.pagination ?? emptyPagination);
        },
      );
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
        <div className="hidden grid-cols-6 gap-4 border-b border-border p-4 text-xs uppercase text-muted md:grid">
          <span>Transaction</span>
          <span>User</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        {payments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No payments recorded yet.
          </p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment._id}
              className="grid gap-2 border-b border-border p-4 last:border-0 md:grid-cols-6 md:items-center md:gap-4"
            >
              <span className="font-mono text-xs">{payment.transactionId}</span>
              <span>
                <b className="block text-sm">{payment.userName}</b>
                <small className="text-muted">{payment.userEmail}</small>
              </span>
              <span className="text-sm">
                BDT {payment.amount.toLocaleString()}
              </span>
              <span className="text-sm capitalize">{payment.method}</span>
              <Badge className="w-fit">{payment.status}</Badge>
              <span className="text-xs text-muted">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString()
                  : "-"}
              </span>
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
