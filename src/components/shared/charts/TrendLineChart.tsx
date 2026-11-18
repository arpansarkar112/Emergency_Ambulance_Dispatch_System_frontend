"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export interface TrendLineChartProps {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    yAxisId?: "left" | "right";
  }>;
}

export const TrendLineChart = memo(function TrendLineChart({
  title,
  description,
  data,
  lines,
}: TrendLineChartProps) {
  const hasRightAxis = lines.some((l) => l.yAxisId === "right");

  return (
    <Card className="min-h-[366px] rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 8,
                right: hasRightAxis ? 8 : 16,
                left: -12,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                stroke="var(--muted-foreground)"
                fontSize={12}
                allowDecimals={false}
              />
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
});

export default TrendLineChart;
