"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DonutDatum {
  label: string;
  value: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 162 74% 52%))",
  "hsl(var(--chart-3, 220 74% 60%))",
  "hsl(var(--chart-4, 40 80% 55%))",
  "hsl(var(--chart-5, 0 72% 60%))",
];

export function DonutChartCard({
  title,
  data,
}: {
  title: string;
  data: DonutDatum[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.map((d) => ({ name: d.label, value: d.value }))}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const v = Number(value);
                return [`${v} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => (
                <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
