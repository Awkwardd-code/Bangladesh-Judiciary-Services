import type { Metadata } from "next";

import { EnrollmentsFilter } from "@/components/admin/enrollments-filter";
import { EnrollmentsTable } from "@/components/admin/enrollments-table";

export const metadata: Metadata = {
  title: "Enrollments — Admin — BJS Prep",
  description: "Approve paid course access and manage student enrollments.",
};

export default function EnrollmentsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Enrollments
          </h1>
          <p className="mt-2 text-base text-muted">
            Approve paid course access and manage student enrollments.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="cursor-pointer rounded-md border border-border bg-transparent px-4 py-2 text-sm text-foreground opacity-60"
          title="Coming soon"
        >
          Export CSV
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value="0" detail="All enrollments" />
        <StatCard label="Pending" value="0" detail="Waiting review" />
        <StatCard label="Approved" value="0" detail="Active access" />
        <StatCard label="Revenue" value="BDT 0" detail="Completed payments" />
      </section>

      <EnrollmentsFilter />
      <EnrollmentsTable />
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}
