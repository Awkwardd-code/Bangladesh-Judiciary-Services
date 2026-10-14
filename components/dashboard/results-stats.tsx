import { Award, BarChart3, ClipboardCheck } from "lucide-react";

export function ResultsStats({
  testsTaken,
  averageScore,
  bestScore,
}: {
  testsTaken: number;
  averageScore: number;
  bestScore: number;
}) {
  const stats = [
    {
      icon: ClipboardCheck,
      label: "Tests taken",
      value: String(testsTaken),
      detail: "All assessment types",
      tone: "bg-sky-50 text-sky-700",
    },
    {
      icon: BarChart3,
      label: "Average score",
      value: `${averageScore}%`,
      detail: "Across scored attempts",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      icon: Award,
      label: "Best score",
      value: `${bestScore}%`,
      detail: "Your personal best",
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section
      aria-label="Results summary"
      className="grid gap-3 sm:grid-cols-3 sm:gap-4"
    >
      {stats.map(({ icon: Icon, label, value, detail, tone }) => (
        <article
          key={label}
          className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-primary">
              {value}
            </p>
            <p className="mt-1 truncate text-xs text-muted">{detail}</p>
          </div>
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon size={19} aria-hidden="true" />
          </span>
        </article>
      ))}
    </section>
  );
}
