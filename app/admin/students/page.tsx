import type { Metadata } from "next";

import { StudentsFilter } from "@/components/admin/students-filter";
import { StudentsTable } from "@/components/admin/students-table";
import { requireAdmin } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Students — Admin — BJS Prep",
  description: "Manage all registered students.",
};

export default async function StudentsPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Students
          </h1>
        </div>
      </header>
      <StudentsFilter />
      <StudentsTable />
    </div>
  );
}
