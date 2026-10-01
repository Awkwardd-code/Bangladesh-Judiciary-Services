"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AttemptActivityPoint = {
  date: string;
  attempts: number;
  averageScore: number;
};

export function AttemptActivityChart({
  data,
}: {
  data: AttemptActivityPoint[];
}) {
  const hasActivity = data.some((point) => point.attempts > 0);

  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-heading text-base font-semibold text-primary">
          Attempts (last 30 days)
        </h2>
        <span className="text-xs text-muted">Live data</span>
      </div>
      {hasActivity ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 4, left: -18 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(0,0,0,0.07)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  new Date(`${value}T00:00:00`).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "short",
                  })
                }
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="attempts"
                allowDecimals={false}
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis yAxisId="score" domain={[0, 100]} hide />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E8E1D5",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                yAxisId="attempts"
                type="monotone"
                dataKey="attempts"
                name="Attempts"
                stroke="#B87333"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="averageScore"
                name="Average score (%)"
                stroke="#12213F"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </section>
  );
}

function ChartEmptyState() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted">
      No data yet.
    </div>
  );
}
