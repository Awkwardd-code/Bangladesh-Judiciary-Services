import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import {
  BarChart3,
  BookOpen,
  FileText,
  HelpCircle,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AttemptActivityChart } from "@/components/dashboard/charts/attempt-activity-chart";
import { AttemptStatusChart } from "@/components/dashboard/charts/attempt-status-chart";
import { SubjectAccuracyChart } from "@/components/dashboard/charts/subject-accuracy-chart";
import { TierDistributionChart } from "@/components/dashboard/charts/tier-distribution-chart";
import { requireSession } from "@/lib/auth-guard";
import { usersCol } from "@/lib/collections";
import { getDashboardStats, getStudentAttemptActivity } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Dashboard — BJS Prep",
  description: "Your BJS Prep account and learning activity.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string | string[] }>;
}) {
  const [session, params] = await Promise.all([
    requireSession(),
    searchParams,
  ]);

  if (!session) {
    redirect("/login?next=%2Fdashboard");
  }

  const userId = new ObjectId(session.userId);
  const [stats, user, activity] = await Promise.all([
    getDashboardStats(),
    (await usersCol()).findOne({ _id: userId }),
    getStudentAttemptActivity(userId, 5),
  ]);

  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {params.forbidden ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          You do not have permission to access the admin panel.
        </div>
      ) : null}
      <section className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary lg:text-3xl">
            Assalamu alaikum, {user.name}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here&apos;s your preparation at a glance.
          </p>
        </div>
        <p className="text-sm text-muted">{today}</p>
      </section>

      <section
        aria-label="Platform statistics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={<Users size={19} />}
          label="Total students"
          value={stats.totals.students.toLocaleString()}
          detail="+12 this week"
        />
        <StatCard
          icon={<FileText size={19} />}
          label="Mock exams"
          value={stats.totals.mockExams.toLocaleString()}
          detail="Published"
        />
        <StatCard
          icon={<HelpCircle size={19} />}
          label="Questions"
          value={stats.totals.questions.toLocaleString()}
          detail="In the bank"
        />
        <StatCard
          icon={<TrendingUp size={19} />}
          label="Success rate"
          value={`${stats.successRate}%`}
          detail="Score above 50%"
        />
      </section>

      <AttemptActivityChart data={activity.chart} />

      <section className="grid gap-6 lg:grid-cols-2">
        <TierDistributionChart data={stats.tierDistribution} />
        <AttemptStatusChart data={stats.attemptStatuses} />
      </section>

      <SubjectAccuracyChart data={stats.topSubjects} />

      <section aria-label="Quick actions">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/dashboard/mock-exams"
            icon={<FileText size={19} />}
            label="Take a Model Test"
          />
          <QuickAction
            href="/dashboard/results"
            icon={<BarChart3 size={19} />}
            label="View Results"
          />
          <QuickAction
            href="/dashboard/materials"
            icon={<BookOpen size={19} />}
            label="Browse Materials"
          />
          <QuickAction
            href="/dashboard/profile"
            icon={<User size={19} />}
            label="Edit Profile"
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-base font-semibold text-primary">
            Recent attempts
          </h2>
          <Link
            href="/dashboard/results"
            className="
              cursor-pointer text-sm font-medium text-primary underline-offset-4
              hover:underline focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-accent
            "
          >
            View all
          </Link>
        </div>
        {activity.recentAttempts.length > 0 ? (
          <div className="mt-4 divide-y divide-border">
            {activity.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <Link href={attempt.href} className="min-w-0 hover:underline">
                  <p className="truncate text-sm font-medium text-foreground">
                    {attempt.subject}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(attempt.date).toLocaleDateString("en", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>
                <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  {attempt.category === "Written" && attempt.score === 0
                    ? attempt.status
                    : `${attempt.scorePercent}%`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 py-8">
            <p className="text-sm text-muted">No attempts yet.</p>
            <Link
              href="/dashboard/mock-exams"
              className="
                inline-flex min-h-10 cursor-pointer items-center rounded-md
                bg-primary px-4 text-sm font-medium text-cream
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-accent focus-visible:ring-offset-2
              "
            >
              Start a test
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
      <span className="absolute left-0 top-0 h-1 w-14 bg-accent" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <span className="text-accent">{icon}</span>
      </div>
      <p className="mt-4 font-heading text-[32px] font-bold leading-none text-primary">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </article>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex min-h-20 cursor-pointer items-center gap-3 rounded-lg
        border border-border bg-card p-5 text-sm font-semibold text-primary
        transition-shadow hover:shadow-md focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-accent
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      <span className="text-accent">{icon}</span>
      {label}
    </Link>
  );
}
