"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Megaphone,
  Target,
} from "lucide-react";

export type DashboardHomeData = {
  name: string;
  today: string;
  stats: {
    enrolledCourses: number;
    examsTaken: number;
    bestScore: number | null;
    freeAttemptsRemaining: number;
    freeAttemptLimit: number;
  };
  courses: {
    id: string;
    title: string;
    slug: string;
    category: "BJS" | "BAR" | "LLB";
    programKind: "course" | "exam";
    coverUrl: string | null;
    durationLabel: string;
  }[];
  recentAttempts: {
    id: string;
    examId: string;
    title: string;
    submittedAt: string | null;
    scorePercent: number | null;
    status: string;
    href: string;
  }[];
  notices: {
    id: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    pinned: boolean;
  }[];
};

export function DashboardHomeClient({ data }: { data: DashboardHomeData }) {
  const firstName = data.name.trim().split(/\s+/)[0] || "Student";

  return (
    <main className="mx-auto max-w-7xl space-y-7">
      <header className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] bg-primary px-6 py-7 text-cream shadow-lg shadow-primary/10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-32 -z-10 size-80 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-1/3 -z-10 h-px w-1/2 bg-gradient-to-r from-transparent via-cream/20 to-transparent"
        />
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Your learning space
          </p>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Assalamu alaikum, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-cream/70 sm:text-base">
            Welcome back. Keep your preparation focused and make today count.
          </p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-xl border border-cream/15 bg-cream/[0.06] px-4 py-3 text-sm font-medium text-cream/85">
          <CalendarDays size={16} />
          {data.today}
        </p>
      </header>

      <section
        aria-label="Your learning statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          icon={<BookOpen size={19} />}
          label="Courses & batches"
          value={data.stats.enrolledCourses.toLocaleString()}
          detail="Approved enrollments"
        />
        <StatCard
          icon={<ClipboardCheck size={19} />}
          label="Exams taken"
          value={data.stats.examsTaken.toLocaleString()}
          detail="Submitted attempts"
        />
        <StatCard
          icon={<Award size={19} />}
          label="Best score"
          value={
            data.stats.bestScore === null ? "—" : `${data.stats.bestScore}%`
          }
          detail="Across submitted exams"
        />
        <StatCard
          icon={<Target size={19} />}
          label="Free attempts left"
          value={`${data.stats.freeAttemptsRemaining}`}
          detail={`of ${data.stats.freeAttemptLimit} attempts`}
        />
      </section>

      <section aria-label="Quick actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/dashboard/courses"
            icon={<BookOpen size={19} />}
            label="My Learning"
          />
          <QuickAction
            href="/dashboard/exams"
            icon={<FileText size={19} />}
            label="Take a Test"
          />
          <QuickAction
            href="/dashboard/results"
            icon={<Award size={19} />}
            label="View Results"
          />
          <QuickAction
            href="/exam-courses"
            icon={<FileText size={19} />}
            label="Browse Model Test Batches"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary">
                My learning
              </h2>
              <p className="mt-1 text-sm text-muted">
                Continue a course or an enrolled model test batch.
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {data.courses.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-background/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-primary/5">
                    {course.coverUrl ? (
                      <Image
                        src={course.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/30">
                        <BookOpen size={30} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                      {course.category} ·{" "}
                      {course.programKind === "exam"
                        ? "Model test batch"
                        : "Course"}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-heading font-semibold text-primary group-hover:underline">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      {course.durationLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active learning yet"
              href="/programs"
              action="Browse programs"
            />
          )}
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-primary">
                Recent exam attempts
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your latest submitted work.
              </p>
            </div>
            <Link
              href="/dashboard/results"
              className="text-sm font-medium text-primary hover:underline"
            >
              All results
            </Link>
          </div>
          {data.recentAttempts.length ? (
            <div className="mt-4 divide-y divide-border">
              {data.recentAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={attempt.href}
                  className="group flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-primary/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {attempt.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleDateString(
                            "en",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            }
                          )
                        : "Date unavailable"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-primary">
                      {attempt.scorePercent === null
                        ? attempt.status
                        : `${attempt.scorePercent}%`}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-accent">
                      Review <ArrowRight size={13} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No exam attempts yet"
              href="/dashboard/exams"
              action="Take a test"
            />
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-accent" />
          <h2 className="font-heading text-lg font-semibold text-primary">
            Latest notices
          </h2>
        </div>
        {data.notices.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.notices.map((notice) => (
              <article
                key={notice.id}
                className="rounded-xl border border-border bg-background/50 p-4"
              >
                {notice.pinned ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Pinned
                  </span>
                ) : null}
                <h3 className="mt-1 font-semibold text-primary">
                  {notice.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {notice.excerpt}
                </p>
                <time
                  dateTime={notice.publishedAt}
                  className="mt-3 block text-xs text-muted"
                >
                  {new Date(notice.publishedAt).toLocaleDateString("en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-muted/5 p-4 text-sm text-muted">
            There are no new notices right now.
          </p>
        )}
      </section>
    </main>
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
    <article className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-cream">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
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
      className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
          {icon}
        </span>
        {label}
      </span>
      <ArrowRight
        size={16}
        className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </Link>
  );
}

function EmptyState({
  title,
  href,
  action,
}: {
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm text-muted">{title}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        {action} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
