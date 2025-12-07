"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

interface TimeSeriesData {
  date: string;
  value: number;
}

interface AnalyticsAreaChartProps {
  data: {
    last24Hours: TimeSeriesData[];
    last7Days: TimeSeriesData[];
    last30Days: TimeSeriesData[];
    lastYear: TimeSeriesData[];
  };
}

const chartConfig = {
  value: {
    label: "Clicks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AnalyticsAreaChart({ data }: AnalyticsAreaChartProps) {
  const [range, setRange] = React.useState<"24h" | "7d" | "30d" | "1y">("24h");

  const chartData = React.useMemo(() => {
    switch (range) {
      case "24h":
        return data.last24Hours;
      case "7d":
        return data.last7Days;
      case "30d":
        return data.last30Days;
      case "1y":
        return data.lastYear;
      default:
        return data.last24Hours;
    }
  }, [range, data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (range === "24h") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (range === "1y") {
      return date.toLocaleDateString([], { month: "short", year: "numeric" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center space-y-2 border-b p-4 sm:flex-row sm:justify-between sm:space-y-0 sm:p-6">
        <div className="flex flex-col justify-center gap-1">
          <CardTitle>Total Clicks</CardTitle>
          <CardDescription>
            Showing total clicks for the selected period
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={range === "24h" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("24h")}
          >
            Last 24h
          </Button>
          <Button
            variant={range === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("7d")}
          >
            Last 7d
          </Button>
          <Button
            variant={range === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("30d")}
          >
            Last 30d
          </Button>
          <Button
            variant={range === "1y" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("1y")}
          >
            Last Year
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 sm:px-6 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDate}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={formatDate} />}
            />
            <defs>
              <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillPrimary)"
              fillOpacity={0.4}
              stroke="var(--color-primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
