import type { Metadata } from "next";

import { PaymentsTable } from "@/components/admin/payments-table";

export const metadata: Metadata = {
  title: "Payments — Admin — LegalPath Bangladesh",
  description: "Track enrollments and revenue.",
};

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
        Payments
      </h1>
      <p className="mt-2 text-base text-muted">
        Review submitted mobile payment transactions and manage course access.
      </p>
      <PaymentsTable />
    </div>
  );
}
