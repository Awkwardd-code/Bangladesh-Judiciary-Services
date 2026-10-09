"use client";

import Link from "next/link";
import { Check, MoreHorizontal, RotateCcw, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TableRowsSkeleton } from "@/components/skeletons/table-rows-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { buildQuery } from "@/lib/query-params";

type EnrollmentRow = {
  id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  isPaid: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string; price: number };
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

const statusClasses: Record<EnrollmentRow["status"], string> = {
  pending: "border-amber-300 text-amber-700",
  approved: "border-emerald-300 text-emerald-700",
  rejected: "border-red-300 text-red-700",
  revoked: "border-border text-muted",
};

export function EnrollmentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    void fetch(`/api/admin/enrollments?${query}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load enrollments.");
        }
        setRows(result.data.enrollments ?? []);
        setPagination(result.data.pagination ?? emptyPagination);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load enrollments."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  async function updateStatus(
    enrollment: EnrollmentRow,
    action: "approve" | "reject" | "revoke"
  ) {
    const response = await fetch(`/api/admin/enrollments/${enrollment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setError(result.error ?? "Unable to update enrollment.");
      return;
    }

    router.refresh();
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, {});
    const refreshed = await fetch(`/api/admin/enrollments?${nextQuery}`);
    const payload = await refreshed.json();
    setRows(payload.data?.enrollments ?? []);
    setPagination(payload.data?.pagination ?? emptyPagination);
  }

  function changePage(page: number) {
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, { page });
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  return (
    <section className="mt-5 space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <TableRowsSkeleton rows={10} columns={6} />
        ) : rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted">
            No enrollments match these filters.
          </p>
        ) : (
          <>
            <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs uppercase tracking-wide text-muted md:grid">
              <span className="col-span-3">Student</span>
              <span className="col-span-3">Course</span>
              <span className="col-span-1">Access</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Requested</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>
            {rows.map((row) => (
              <article
                key={row.id}
                className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-4 md:px-6"
              >
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-foreground">
                    {row.user.name}
                  </p>
                  <p className="text-xs text-muted">{row.user.email}</p>
                </div>
                <p className="text-sm md:col-span-3">{row.course.title}</p>
                <div className="md:col-span-1">
                  <Badge className="w-fit">
                    {row.isPaid ? "Paid" : "Included"}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <Badge className={statusClasses[row.status]}>
                    {row.status}
                  </Badge>
                </div>
                <time
                  className="text-xs text-muted md:col-span-2"
                  dateTime={row.createdAt}
                >
                  {new Date(row.createdAt).toLocaleDateString()}
                </time>
                <div className="flex justify-end md:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button
                        type="button"
                        aria-label="Enrollment actions"
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link
                          href={`/admin/students/${row.user.id}`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <MoreHorizontal size={15} />
                          View student
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={row.status !== "pending"}>
                        <button
                          type="button"
                          onClick={() => void updateStatus(row, "approve")}
                          className="flex w-full cursor-pointer items-center gap-2"
                        >
                          <Check size={15} />
                          Approve
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={row.status !== "pending"}>
                        <button
                          type="button"
                          onClick={() => void updateStatus(row, "reject")}
                          className="flex w-full cursor-pointer items-center gap-2"
                        >
                          <X size={15} />
                          Reject
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={row.status !== "approved"}>
                        <button
                          type="button"
                          onClick={() => void updateStatus(row, "revoke")}
                          className="flex w-full cursor-pointer items-center gap-2"
                        >
                          <RotateCcw size={15} />
                          Revoke
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={changePage}
      />
    </section>
  );
}
