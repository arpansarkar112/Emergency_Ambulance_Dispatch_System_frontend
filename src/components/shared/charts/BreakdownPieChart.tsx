"use client";

import { memo, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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

export interface BreakdownPieChartProps {
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
}

export const BreakdownPieChart = memo(function BreakdownPieChart({
  title,
  description,
  data,
}: BreakdownPieChartProps) {
  const { nonZero, chartData } = useMemo(() => {
    const nz = data.filter((d) => d.value > 0);
    return {
      nonZero: nz,
      chartData: nz.length > 0 ? nz : [{ name: "No Data Yet", value: 1 }],
    };
  }, [data]);

  return (
    <Card className="min-h-[366px] rounded-xl border border-border/80 bg-card shadow-xs">
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
                isAnimationActive={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={
                      nonZero.length > 0
                        ? PIE_COLORS[idx % PIE_COLORS.length]
                        : "var(--muted)"
                    }
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
});

export default BreakdownPieChart;
