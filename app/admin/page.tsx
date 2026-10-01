import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Megaphone,
  Users,
  X,
} from "lucide-react";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { requireAdmin } from "@/lib/auth-guard";
import { enrollmentsCol, paymentsCol, usersCol } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Admin — BJS Prep",
  description: "Platform overview for administrators.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/login");
  }

  const [students, enrollments, pendingEnrollments, recentUsers, paymentTotal] =
    await Promise.all([
      (await usersCol()).countDocuments(),
      (await enrollmentsCol()).countDocuments(),
      (await enrollmentsCol()).countDocuments({ status: "pending" }),
      (await usersCol()).find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      (await paymentsCol())
        .aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        .toArray(),
    ]);

  const totalRevenue = paymentTotal[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary lg:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-base text-muted">Platform at a glance.</p>
        </div>
        <Tooltip content="Available once students API is wired.">
          <button
            type="button"
            disabled
            className="h-10 w-fit rounded-md border border-border px-4 text-sm text-foreground opacity-60"
          >
            Export CSV
          </button>
        </Tooltip>
      </header>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" number={String(students ?? 0)} detail="Live total" />
        <StatCard label="Total enrollments" number={String(enrollments ?? 0)} detail="Across all courses" />
        <StatCard label="Pending enrollments" number={String(pendingEnrollments ?? 0)} detail="Awaiting approval" />
        <StatCard label="Total revenue" number={`BDT ${totalRevenue ?? 0}`} detail="Completed payments" />
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-primary">
            Pending approvals
          </h2>
          <Link
            href="/admin/enrollments"
            className="text-sm text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <Card className="mt-4 overflow-hidden border-border bg-card">
          {pendingEnrollments > 0 ? (
            <PendingApprovals />
          ) : (
            <EmptyApprovals />
          )}
        </Card>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-primary">
            Recent registrations
          </h2>
          <Link
            href="/admin/students"
            className="text-sm text-accent hover:underline"
          >
            View all students →
          </Link>
        </div>
        <Card className="mt-4 overflow-hidden border-border bg-card">
          <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs uppercase tracking-wide text-muted md:grid">
            <span className="col-span-4">Name</span>
            <span className="col-span-3">Tier</span>
            <span className="col-span-2">Verified</span>
            <span className="col-span-3 text-right">Date</span>
          </div>
          {recentUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">No recent registrations yet.</div>
          ) : (
            recentUsers.map((student) => (
              <div
                key={student._id.toString()}
                className="grid grid-cols-1 gap-3 border-b border-border px-6 py-4 last:border-b-0 md:grid-cols-12 md:items-center md:gap-4"
              >
                <div className="md:col-span-4">
                  <p className="text-sm font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted">{student.email}</p>
                </div>
                <div className="md:col-span-3">
                  <Badge
                    className={
                      student.tier === "UNIVERSITY"
                        ? "border-primary text-primary"
                        : "border-accent text-accent"
                    }
                  >
                    {student.tier === "UNIVERSITY" ? "University" : "Other"}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  {student.verified ? (
                    <Check className="text-accent" size={16} />
                  ) : (
                    <X className="text-muted" size={16} />
                  )}
                </div>
                <p className="text-xs text-muted md:col-span-3 md:text-right">
                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            ))
          )}
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl font-bold text-primary">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            href="/admin/students"
            icon={<Users size={24} className="text-primary" />}
            title="Manage students"
            description="View, filter, and approve registrations."
          />
          <QuickAction
            href="/admin/notices"
            icon={<Megaphone size={24} className="text-primary" />}
            title="Post a notice"
            description="Publish announcements to all students."
            badge="Coming soon"
          />
          <QuickAction
            href="/admin/payments"
            icon={<CreditCard size={24} className="text-primary" />}
            title="Review payments"
            description="Track enrollments and revenue."
            badge="Coming soon"
          />
        </div>
      </section>
    </div>
  );
}

async function PendingApprovals() {
  const pending = await (await enrollmentsCol())
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  if (pending.length === 0) {
    return <EmptyApprovals />;
  }

  const userIds = pending.map((item) => item.userId);
  const users = await (await usersCol())
    .find({ _id: { $in: userIds } })
    .toArray();

  return (
    <>
      <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs uppercase tracking-wide text-muted md:grid">
        <span className="col-span-4">Name</span>
        <span className="col-span-4">Email</span>
        <span className="col-span-2">Date</span>
        <span className="col-span-2 text-right">Action</span>
      </div>
      {pending.map((item) => {
        const student = users.find((user) => user._id.toString() === item.userId.toString());

        return (
          <div
            key={item._id.toString()}
            className="grid grid-cols-1 gap-3 border-b border-border px-6 py-4 last:border-b-0 md:grid-cols-12 md:items-center md:gap-4"
          >
            <div className="md:col-span-4">
              <p className="text-sm font-medium text-foreground">{student?.name ?? "Pending student"}</p>
            </div>
            <p className="text-sm text-foreground md:col-span-4">{student?.email ?? "—"}</p>
            <p className="text-xs text-muted md:col-span-2">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
            </p>
            <div className="md:col-span-2 md:text-right">
              <button
                type="button"
                className="h-8 rounded-md bg-primary px-3 text-xs text-cream hover:bg-primary-dark"
              >
                Review
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

function StatCard({ label, number, detail }: { label: string; number: string; detail: string }) {
  return (
    <Card className="relative border-border bg-card p-4 sm:p-6">
      <span className="absolute left-6 top-0 h-1 w-10 rounded-b bg-accent" />
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-heading text-4xl font-bold text-primary">{number}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </Card>
  );
}

function EmptyApprovals() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto text-muted" size={40} />
      <h3 className="mt-4 text-sm font-medium text-primary">
        No pending approvals.
      </h3>
      <p className="mt-1 text-xs text-muted">New registrations will appear here.</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      {icon}
      <h3 className="mt-4 text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {badge && (
        <Badge className="mt-3 border-border text-xs text-muted">{badge}</Badge>
      )}
    </Link>
  );
}
