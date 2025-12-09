"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  MousePointerClick,
  Link as LinkIcon,
  Activity,
  LucideIcon,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OverviewData {
  totalLinks: number;
  totalClicks: number;
  currentPeriodClicks: number;
  previousPeriodClicks: number;
  growthRate: number;
}

export default function GrowthRateBlock() {
  const { data, error, isLoading } = useSWR<OverviewData>(
    "/api/analytics/overview",
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="bg-muted/20 h-4 w-24 rounded" />
              <div className="bg-muted/20 h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 mb-2 h-8 w-16 rounded" />
              <div className="bg-muted/20 h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load analytics data.</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Total Clicks Card */}
        <CellFrame title="Total Clicks" Icon={MousePointerClick}>
          <div className="text-2xl font-bold">
            {data.totalClicks.toLocaleString()}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            All time clicks across all links
          </p>
        </CellFrame>

        {/* Growth Rate Card */}
        <CellFrame title="Weekly Growth" Icon={Activity}>
          <div className="flex items-center gap-2 text-2xl font-bold">
            {data.currentPeriodClicks}
            <span className="text-muted-foreground text-sm font-normal">
              clicks (7d)
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {data.growthRate > 0 ? (
              <span className="flex items-center text-xs font-medium text-green-600">
                <ArrowUp className="mr-1 h-3 w-3" />
                {data.growthRate === 100 && data.previousPeriodClicks === 0
                  ? "New"
                  : `${data.growthRate.toFixed(1)}%`}
              </span>
            ) : data.growthRate < 0 ? (
              <span className="flex items-center text-xs font-medium text-red-600">
                <ArrowDown className="mr-1 h-3 w-3" />
                {Math.abs(data.growthRate).toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center text-xs font-medium">
                <Minus className="mr-1 h-3 w-3" />
                0%
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              vs previous 7 days
            </span>
          </div>
        </CellFrame>

        {/* Total Links Card */}
        <CellFrame title="Total Links" Icon={LinkIcon}>
          <div className="text-2xl font-bold">
            {data.totalLinks.toLocaleString()}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Total created short URLs
          </p>
        </CellFrame>
      </div>
    </div>
  );
}

interface CellFrameProps {
  title: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}

function CellFrame({ title, Icon, children }: CellFrameProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="bg-muted rounded-full p-2">
          <Icon className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
