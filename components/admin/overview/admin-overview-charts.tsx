"use client";

import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type {
  ActivityPoint,
  AdminOverviewStats,
} from "@/lib/admin-overview-query";

const pieColors = ["var(--chart-primary)", "var(--chart-accent)"];

export function AdminOverviewCharts({
  trend,
  stats,
}: {
  trend: ActivityPoint[];
  stats: AdminOverviewStats;
}) {
  const pieData = [
    {
      name: "University",
      value: stats.students.university,
      fill: pieColors[0],
    },
    {
      name: "Other",
      value: Math.max(0, stats.students.total - stats.students.university),
      fill: pieColors[1],
    },
  ];

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Activity (last 30 days)
          </h2>
          <span className="text-xs text-muted">Live data</span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trend}
              margin={{ top: 12, right: 8, left: 0, bottom: 12 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--chart-grid)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-BD", {
                    day: "2-digit",
                    month: "short",
                  })
                }
                tickLine={false}
                axisLine={false}
                minTickGap={18}
                stroke="var(--chart-label)"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="var(--chart-label)"
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number | string, name: string) => [
                  value,
                  name,
                ]}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--chart-grid)",
                  backgroundColor: "var(--chart-tooltip)",
                  color: "var(--chart-text)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="attempts"
                stroke="var(--chart-accent)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Attempts"
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="var(--chart-primary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 2.5 }}
                name="Enrollments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-primary">
            Students by tier
          </h2>
          <span className="text-xs text-muted">Live data</span>
        </div>

        <div className="relative h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | string) => [value, "Students"]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--chart-grid)",
                  backgroundColor: "var(--chart-tooltip)",
                  color: "var(--chart-text)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-primary">
                {stats.students.total}
              </p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Students
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
