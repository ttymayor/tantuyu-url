"use client";

import useSWR from "swr";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { AnalyticsMap } from "@/components/dashboard/analytics-map";
import { Loader2, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AnalyticsViewProps {
  urlId: string;
}

export function AnalyticsView({ urlId }: AnalyticsViewProps) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/analytics/${urlId}`,
    fetcher
  );

  if (error) return <div>Failed to load analytics</div>;
  if (isLoading && !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                Analytics: <span className="font-mono text-primary">/{data.urlInfo.shortCode}</span>
            </h1>
            <p className="text-sm text-muted-foreground truncate max-w-lg">
                {data.urlInfo.originalUrl}
            </p>
            </div>
        </div>
        <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => mutate()}
            disabled={isLoading}
        >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Total Clicks
          </div>
          <div className="text-2xl font-bold">{data.eventsCount}</div>
        </div>
      </div>

      {/* Map Section */}
      {data.mapData.length > 0 && <AnalyticsMap data={data.mapData} />}

      <AnalyticsCharts data={data.chartsData} />
    </div>
  );
}