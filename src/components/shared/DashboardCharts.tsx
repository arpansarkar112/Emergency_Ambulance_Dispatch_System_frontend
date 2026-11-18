"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-4)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
];

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function TrendLineChart({
  title,
  description,
  data,
  lines,
}: {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  lines: Array<{ dataKey: string; name: string; color: string; yAxisId?: "left" | "right" }>;
}) {
  const hasRightAxis = lines.some((l) => l.yAxisId === "right");

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: hasRightAxis ? 8 : 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
              {hasRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => `$${v}`}
                />
              )}
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  yAxisId={line.yAxisId || "left"}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryBarChart({
  title,
  description,
  data,
  xKey,
  bars,
}: {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  bars: Array<{ dataKey: string; name: string; color: string }>;
}) {
  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {bars.map((bar) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  fill={bar.color}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BreakdownPieChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
}) {
  const nonZero = data.filter((d) => d.value > 0);
  const chartData = nonZero.length > 0 ? nonZero : [{ name: "No Data Yet", value: 1 }];

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="48%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={nonZero.length > 0 ? PIE_COLORS[idx % PIE_COLORS.length] : "var(--muted)"}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
