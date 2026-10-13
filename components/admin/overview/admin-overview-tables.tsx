"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  PendingEnrollment,
  RecentStudent,
  TopPerformer,
} from "@/lib/admin-overview-query";

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((piece) => piece[0]?.toUpperCase() ?? "")
      .join("") || "S"
  );
}

export function AdminOverviewTables({
  recentStudents,
  pendingEnrollments,
  topPerformers,
}: {
  recentStudents: RecentStudent[];
  pendingEnrollments: PendingEnrollment[];
  topPerformers: TopPerformer[];
}) {
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-3">
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Recent students
          </h2>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentStudents.length === 0 ? (
            <p className="py-4 text-sm text-muted">No recent students.</p>
          ) : (
            recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 font-heading text-xs font-bold text-primary">
                    {initialsFromName(student.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {student.name}
                    </p>
                    <p className="truncate text-xs text-muted">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      student.verified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {student.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <span className="text-[11px] text-muted">
                    {formatRelativeDate(student.registeredAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Pending enrollments
          </h2>
          <Link
            href="/admin/enrollments"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {pendingEnrollments.length === 0 ? (
            <p className="py-4 text-sm text-muted">No pending enrollments.</p>
          ) : (
            pendingEnrollments.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {entry.userName}
                  </p>
                  <p className="truncate text-xs text-muted">{entry.courseTitle}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] text-muted">
                    {formatRelativeDate(entry.requestedAt)}
                  </span>
                  <Link
                    href="/admin/enrollments"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Review
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Top performers
          </h2>
          <Link
            href="/admin/leaderboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {topPerformers.length === 0 ? (
            <p className="py-4 text-sm text-muted">No exam attempts yet.</p>
          ) : (
            topPerformers.map((performer, index) => (
              <div
                key={performer.attemptId}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                    {index === 0 ? (
                      <Trophy size={16} className="text-amber-600" />
                    ) : index === 1 ? (
                      <Trophy size={16} className="text-slate-400" />
                    ) : index === 2 ? (
                      <Trophy size={16} className="text-amber-800" />
                    ) : (
                      <span className="font-heading text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {performer.userName}
                    </p>
                    <p className="truncate text-xs text-muted">{performer.examTitle}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-heading text-sm font-bold text-primary">
                    {performer.scorePercent.toFixed(0)}%
                  </p>
                  <Link
                    href={`/admin/exam-review/${performer.attemptId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Review
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
