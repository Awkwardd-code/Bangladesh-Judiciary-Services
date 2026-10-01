"use client";

import Link from "next/link";
import { Check, MoreHorizontal, ShieldOff, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { buildQuery } from "@/lib/query-params";

type Student = {
  id: string;
  name: string;
  email: string;
  roll: string;
  university: string;
  tier: "UNIVERSITY" | "OTHER";
  role: "student" | "admin";
  status: "verified" | "unverified" | "pending";
  createdAt: string;
  disabled: boolean;
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

export function StudentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    void fetch(`/api/admin/students?${query}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Unable to load students.");
        }
        setStudents(result.data.students ?? []);
        setPagination(result.data.pagination ?? emptyPagination);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load students.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  async function updateStudent(student: Student, action: "approve" | "disable") {
    const response = await fetch(`/api/admin/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setError(result.error ?? "Unable to update the student.");
      return;
    }

    router.refresh();
    const current = new URLSearchParams(searchParams.toString());
    const nextQuery = buildQuery(current, {});
    void fetch(`/api/admin/students?${nextQuery}`)
      .then((res) => res.json())
      .then((payload) => {
        setStudents(payload.data?.students ?? []);
        setPagination(payload.data?.pagination ?? emptyPagination);
      });
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
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs uppercase tracking-wide text-muted md:grid">
          <span className="col-span-3">Student</span>
          <span className="col-span-2">Roll / ID</span>
          <span className="col-span-3">University</span>
          <span className="col-span-1">Tier</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-1">Role</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>
        {error ? (
          <p role="alert" className="px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading students...</p>
        ) : students.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="mx-auto text-muted" size={36} />
            <p className="mt-3 text-sm text-muted">
              No students match these filters.
            </p>
          </div>
        ) : (
          students.map((student) => (
            <article
              key={student.id}
              className="grid grid-cols-1 gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-4 md:px-6"
            >
              <Link
                href={`/admin/students/${student.id}`}
                className="min-w-0 md:col-span-3"
              >
                <span className="block truncate text-sm font-medium text-primary">
                  {student.name}
                </span>
                <span className="block truncate text-xs text-muted">
                  {student.email}
                </span>
              </Link>
              <span className="text-sm md:col-span-2">{student.roll}</span>
              <span className="truncate text-sm md:col-span-3">
                {student.university}
              </span>
              <span className="md:col-span-1">
                <Badge className="w-fit">
                  {student.tier === "UNIVERSITY" ? "University" : "Other"}
                </Badge>
              </span>
              <span className="md:col-span-1">
                <StatusBadge status={student.status} disabled={student.disabled} />
              </span>
              <span className="text-sm capitalize md:col-span-1">
                {student.role}
              </span>
              <div className="flex justify-end md:col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      aria-label={`Actions for ${student.name}`}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-primary/5 hover:text-primary"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem disabled={student.status !== "pending"}>
                      <button
                        type="button"
                        onClick={() => void updateStudent(student, "approve")}
                        className="flex w-full cursor-pointer items-center gap-2"
                      >
                        <Check size={15} />
                        Approve
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={student.disabled} destructive>
                      <button
                        type="button"
                        onClick={() => void updateStudent(student, "disable")}
                        className="flex w-full cursor-pointer items-center gap-2"
                      >
                        <ShieldOff size={15} />
                        Disable account
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          ))
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

function StatusBadge({
  status,
  disabled,
}: {
  status: Student["status"];
  disabled: boolean;
}) {
  const label = disabled ? "Disabled" : status;
  const className = disabled
    ? "border-red-300 text-red-700"
    : status === "pending"
      ? "border-amber-300 text-amber-700"
      : status === "verified"
        ? "border-emerald-300 text-emerald-700"
        : "border-border text-muted";

  return <Badge className={className}>{label}</Badge>;
}
