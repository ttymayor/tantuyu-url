"use client";

import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle, Clock, Database, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HealthData {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: "connected" | "disconnected";
    latency?: string;
  };
  error?: string;
}

export default function HealthPage() {
  const { data, error, isLoading } = useSWR<HealthData>("/api/health", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    
    return parts.join(" ");
  };

  const isHealthy = data?.status === "healthy";
  const isDbConnected = data?.database?.status === "connected";

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-6 w-6" />
              <CardTitle>System Unavailable</CardTitle>
            </div>
            <CardDescription>Could not connect to health service</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-500" />
              <CardTitle>System Status</CardTitle>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-20 rounded-full" />
            ) : (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                  isHealthy
                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
                    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900"
                )}
              >
                {isHealthy ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Operational</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Issues Detected</span>
                  </>
                )}
              </div>
            )}
          </div>
          <CardDescription>
            Real-time monitoring of service health
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Database Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Database className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">Main data store</p>
                </div>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <Skeleton className="h-4 w-16 mb-1" />
                ) : (
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDbConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {isDbConnected ? "Connected" : "Disconnected"}
                  </p>
                )}
                {data?.database?.latency && (
                  <p className="text-xs text-muted-foreground">{data.database.latency}</p>
                )}
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-xs text-muted-foreground">Since last restart</p>
                </div>
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatUptime(data?.uptime || 0)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t text-xs text-center text-muted-foreground">
            <p>Last updated: {isLoading ? "..." : new Date().toLocaleTimeString()}</p>
            {data?.environment && <p className="mt-1 uppercase tracking-wider text-[10px] opacity-70">{data.environment}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
