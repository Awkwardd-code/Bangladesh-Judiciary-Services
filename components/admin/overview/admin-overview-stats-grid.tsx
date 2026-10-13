"use client";

import type { LucideIcon } from "lucide-react";
import { ClipboardList, CreditCard, FileText, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { AdminOverviewStats } from "@/lib/admin-overview-query";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-border bg-card p-6">
      <span className="absolute left-0 top-0 h-1 w-14 bg-accent" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <span className="text-primary">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-5 font-heading text-[30px] font-bold leading-none text-primary">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </Card>
  );
}

export function AdminOverviewStatsGrid({
  stats,
}: {
  stats: AdminOverviewStats;
}) {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Students"
        value={stats.students.total.toLocaleString()}
        detail={`+${stats.students.thisWeek} this week`}
      />
      <StatCard
        icon={ClipboardList}
        label="Enrollments"
        value={stats.enrollments.total.toLocaleString()}
        detail={`${stats.enrollments.pending} pending`}
      />
      <StatCard
        icon={FileText}
        label="Exam attempts"
        value={stats.exams.attempts.toLocaleString()}
        detail={`Avg ${stats.exams.avgScore.toFixed(0)}%`}
      />
      <StatCard
        icon={CreditCard}
        label="Revenue"
        value={`BDT ${stats.revenue.totalBdt.toLocaleString()}`}
        detail={`This month: BDT ${stats.revenue.thisMonthBdt.toLocaleString()}`}
      />
    </section>
  );
}
