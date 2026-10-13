import { Award, BarChart3, ClipboardCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

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
      detail: "Across all test types",
    },
    {
      icon: BarChart3,
      label: "Average score",
      value: `${averageScore}%`,
      detail: "Graded and scored attempts",
    },
    {
      icon: Award,
      label: "Best score",
      value: `${bestScore}%`,
      detail: "Highest attempt score",
    },
  ];

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-3">
      {stats.map(({ icon: Icon, label, value, detail }) => (
        <Card
          key={label}
          className="group relative overflow-hidden rounded-2xl border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {label}
              </p>
              <p className="mt-3 font-heading text-4xl font-bold tracking-tight text-primary">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted">{detail}</p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-cream">
              <Icon size={20} />
            </span>
          </div>
        </Card>
      ))}
    </section>
  );
}
