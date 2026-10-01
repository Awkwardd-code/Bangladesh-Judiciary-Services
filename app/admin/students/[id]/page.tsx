import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight, ShieldCheck } from "lucide-react";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";

import { PromoteUserButton } from "@/components/admin/promote-user-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Student — Admin — BJS Prep",
  description: "Review a student profile and account activity.",
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const user = await (await usersCol()).findOne({ _id: new ObjectId(id) });

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin/students" className="hover:text-primary">
          Students
        </Link>
        <ChevronRight size={14} />
        <span>Student profile</span>
      </div>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {user.email} {user.roll ? `· Roll ${user.roll}` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <PromoteUserButton
            userId={user._id.toString()}
            currentRole={user.role}
            userName={user.name}
          />
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted">
            <ShieldCheck size={14} />
            {user.role === "admin" ? "Admin" : "Student"}
          </span>
        </div>
      </header>

      <Card className="mt-8 border-border bg-card p-5 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-cream">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="border-primary text-xs text-primary">
                {user.tier === "UNIVERSITY" ? "University" : "Other"}
              </Badge>
              <Badge
                className={
                  user.role === "admin"
                    ? "border-amber-300 text-xs text-amber-700"
                    : "border-border text-xs text-muted"
                }
              >
                {user.role === "admin" ? "Admin" : "Student"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-border" />
        <div className="grid gap-5 lg:grid-cols-2">
          <DetailField label="Full name" value={user.name} />
          <DetailField label="Email" value={user.email} />
          <DetailField label="Roll number" value={user.roll ?? "—"} />
          <DetailField label="University" value={user.university ?? "—"} />
          <DetailField label="Verified" value={user.verified ? "Yes" : "No"} />
          <DetailField label="Approved" value={user.approved ? "Yes" : "No"} />
          <DetailField label="Last login" value={user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"} />
          <DetailField label="Account ID" value={id} />
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-primary">Enrollments</h2>
        <Card className="mt-4 overflow-hidden border-border bg-card">
          <div className="py-12 text-center">
            <BookOpen className="mx-auto text-muted" size={40} />
            <h3 className="mt-4 text-sm font-medium text-primary">
              No enrollments yet.
            </h3>
            <p className="mt-1 text-xs text-muted">
              This student hasn&apos;t enrolled in any courses.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
