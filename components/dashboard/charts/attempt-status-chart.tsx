"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AttemptStatusEntry = {
  status: string;
  count: number;
};

export function AttemptStatusChart({ data }: { data: AttemptStatusEntry[] }) {
  const hasData = data.some((entry) => entry.count > 0);

  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-primary">
        Attempt outcomes
      </h2>
      {hasData ? (
        <div className="mt-3 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 8, bottom: 4, left: -18 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(0,0,0,0.07)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="status"
                tickFormatter={formatStatus}
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(value) => formatStatus(String(value))}
                contentStyle={{
                  border: "1px solid #E8E1D5",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Attempts" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.status === "submitted" ? "#B87333" : "#12213F"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </section>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("-", " ");
}

function ChartEmptyState() {
  return (
    <div className="flex h-[250px] items-center justify-center text-sm text-muted">
      No data yet.
    </div>
  );
}
