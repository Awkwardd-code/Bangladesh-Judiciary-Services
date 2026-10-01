"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type TierEntry = {
  tier: string;
  count: number;
};

const colors = ["#12213F", "#B87333"];

export function TierDistributionChart({ data }: { data: TierEntry[] }) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-primary">
        Student distribution
      </h2>
      {total > 0 ? (
        <div className="relative mt-3 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="tier"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.tier} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8E1D5",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value: string) => tierLabel(value)}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[58%] flex-col items-center justify-center">
            <span className="font-heading text-2xl font-bold text-primary">
              {total}
            </span>
            <span className="text-xs text-muted">students</span>
          </div>
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </section>
  );
}

function tierLabel(tier: string) {
  return tier === "UNIVERSITY" ? "University" : "Other";
}

function ChartEmptyState() {
  return (
    <div className="flex h-[250px] items-center justify-center text-sm text-muted">
      No data yet.
    </div>
  );
}
