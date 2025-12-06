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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

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
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>Clicks by device type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={deviceChartConfig}
            className="min-h-[300px] w-full"
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
              <ChartLegend
                content={
                  <ChartLegendContent
                    nameKey="name"
                    payload={deviceData.map((item) => ({
                      value: item.name,
                      dataKey: "value",
                      color: item.fill,
                      payload: item,
                    }))}
                  />
                }
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Browsers Bar Chart (Horizontal) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Browsers</CardTitle>
          <CardDescription>Clicks by browser</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={browserChartConfig}
            className="min-h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={browserData}
              layout="vertical"
              margin={{ left: 0, right: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={5}>
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
          <CardTitle>Operating Systems</CardTitle>
          <CardDescription>Clicks by OS</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={osChartConfig}
            className="min-h-[300px] w-full"
          >
            <BarChart accessibilityLayer data={data.os}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Countries Bar Chart (Horizontal) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
          <CardDescription>Clicks by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={countryChartConfig}
            className="min-h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data.countries}
              layout="vertical"
              margin={{ left: 0, right: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={80}
              />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
