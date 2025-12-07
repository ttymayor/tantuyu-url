"use client";

import useSWR from "swr";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { AnalyticsAreaChart } from "@/components/dashboard/analytics-area-chart";
import { AnalyticsMap } from "@/components/dashboard/analytics-map";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AnalyticsViewProps {
  urlId: string;
}

export function AnalyticsView({ urlId }: AnalyticsViewProps) {
  const { data, error, isLoading } = useSWR(`/api/analytics/${urlId}`, fetcher);

  if (error) return <div>Failed to load analytics</div>;
  if (isLoading && !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              Analytics:{" "}
              <span className="text-primary font-mono">
                /{data.urlInfo.shortCode}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg truncate text-sm">
              {data.urlInfo.originalUrl}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">
            Total Clicks
          </div>
          <div className="text-2xl font-bold">{data.eventsCount}</div>
        </div>
      </div>

      <AnalyticsAreaChart data={data.timeSeries} />

      {/* Map Section */}
      {data.mapData.length > 0 && <AnalyticsMap data={data.mapData} />}

      <AnalyticsCharts data={data.chartsData} />
    </div>
  );
}
