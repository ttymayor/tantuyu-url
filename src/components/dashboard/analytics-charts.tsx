"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Label,
} from "recharts";
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
import { Globe, MapPin, Monitor, Smartphone } from "lucide-react";

interface AnalyticsData {
  browsers: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  os: { name: string; value: number }[];
  countries: { name: string; value: number }[];
}

const deviceChartConfig = {
  Desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  Mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  Tablet: {
    label: "Tablet",
    color: "var(--chart-3)",
  },
  Unknown: {
    label: "Unknown",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const browserChartConfig = {
  value: {
    label: "Clicks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const osChartConfig = {
  value: {
    label: "Clicks",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const countryChartConfig = {
  value: {
    label: "Clicks",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const getDeviceDataWithColors = (data: { name: string; value: number }[]) => {
  return data.map((item) => {
    const config =
      deviceChartConfig[item.name as keyof typeof deviceChartConfig];
    return {
      ...item,
      fill: config?.color || "var(--chart-5)",
    };
  });
};

const getBrowserDataWithColors = (data: { name: string; value: number }[]) => {
  return data.map((item) => ({
    ...item,
    fill: "var(--color-value)",
  }));
};

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const deviceData = getDeviceDataWithColors(data.devices);
  const browserData = getBrowserDataWithColors(data.browsers);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Devices Pie Chart */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone />
            Device Distribution
          </CardTitle>
          <CardDescription>Clicks by device type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={deviceChartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={deviceData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const total = deviceData.reduce(
                        (acc, curr) => acc + curr.value,
                        0,
                      );
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Clicks
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Browsers Bar Chart (Horizontal) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe />
            Top Browsers
          </CardTitle>
          <CardDescription>Clicks by browser</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={browserChartConfig}>
            <BarChart accessibilityLayer data={browserData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={8}
                strokeWidth={2}
              >
                <Label
                  content={(props) => {
                    if (!props || typeof props !== "object") return null;
                    const { x, y, width, value } = props as {
                      x?: number;
                      y?: number;
                      width?: number;
                      value?: number;
                    };
                    if (
                      typeof x !== "number" ||
                      typeof y !== "number" ||
                      typeof width !== "number"
                    )
                      return null;
                    const dataItem = browserData.find(
                      (item) => item.value === value,
                    );
                    if (!dataItem) return null;
                    return (
                      <text
                        x={x + 8}
                        y={y + width / 2}
                        fill="white"
                        fontSize={12}
                        dominantBaseline="middle"
                        className="font-medium"
                      >
                        {dataItem.name}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* OS Bar Chart (Vertical) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor />
            Operating Systems
          </CardTitle>
          <CardDescription>Clicks by OS</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={osChartConfig}>
            <BarChart accessibilityLayer data={data.os}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={8}
                strokeWidth={2}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Countries Bar Chart (Horizontal) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin />
            Top Locations
          </CardTitle>
          <CardDescription>Clicks by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={countryChartConfig}>
            <BarChart accessibilityLayer data={data.countries}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={8}
                strokeWidth={2}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
