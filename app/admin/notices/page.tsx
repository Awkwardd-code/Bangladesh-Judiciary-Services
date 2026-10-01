import type { Metadata } from "next";

import { NoticesTable } from "@/components/admin/notices-table";

export const metadata: Metadata = {
  title: "Notices — Admin — BJS Prep",
  description: "Publish announcements to students.",
};

export default function NoticesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Notices
          </h1>
          <p className="mt-2 text-base text-muted">
            Publish announcements to students.
          </p>
        </div>
      </header>
      <NoticesTable />
    </div>
  );
}
