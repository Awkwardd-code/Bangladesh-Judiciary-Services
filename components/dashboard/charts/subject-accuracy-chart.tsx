"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SubjectAccuracy = {
  subject: string;
  accuracy: number;
};

export function SubjectAccuracyChart({ data }: { data: SubjectAccuracy[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-primary">
        Subject-wise accuracy
      </h2>
      {data.length > 0 ? (
        <div className="mt-5 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 38, bottom: 4, left: 10 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="rgba(0,0,0,0.07)"
                strokeDasharray="4 4"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value}%`}
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="subject"
                width={110}
                tick={{ fill: "#6E6960", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Accuracy"]}
                contentStyle={{
                  border: "1px solid #E8E1D5",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="accuracy" fill="#B87333" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="accuracy"
                  position="right"
                  formatter={(value: number | string) => `${value}%`}
                  style={{ fill: "#14110C", fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted">
          No data yet.
        </div>
      )}
    </section>
  );
}
