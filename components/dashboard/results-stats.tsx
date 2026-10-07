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
    ["Tests taken", String(testsTaken), "Across all test types"],
    ["Average score", `${averageScore}%`, "Graded and scored attempts"],
    ["Best score", `${bestScore}%`, "Highest attempt score"],
  ];

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-3">
      {stats.map(([label, value, detail]) => (
        <Card key={label} className="relative border-border bg-card p-6">
          <span className="absolute left-6 top-0 h-1 w-10 rounded-b bg-accent" />
          <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 font-heading text-4xl font-bold text-primary">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted">{detail}</p>
        </Card>
      ))}
    </section>
  );
}
