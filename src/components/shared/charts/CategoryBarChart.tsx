"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

export interface CategoryBarChartProps {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  bars: Array<{ dataKey: string; name: string; color: string }>;
}

export const CategoryBarChart = memo(function CategoryBarChart({
  title,
  description,
  data,
  xKey,
  bars,
}: CategoryBarChartProps) {
  return (
    <Card className="min-h-[366px] rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey={xKey}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {bars.map((bar) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  fill={bar.color}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export default CategoryBarChart;
