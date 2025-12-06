"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { UrlTable } from "@/components/dashboard/url-table";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UrlListManager() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const { data, error, isLoading, mutate } = useSWR(
    `/api/urls?page=${page}&limit=${limit}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Recent URLs</h2>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => mutate()}
                disabled={isLoading}
            >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh</span>
            </Button>
        </div>
        {isLoading && !data ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
            <span className="text-sm text-muted-foreground">
            Total: {data?.total || 0}
            </span>
        )}
      </div>

      {isLoading && !data ? (
          <div className="flex h-48 items-center justify-center border rounded-md">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      ) : (
        <>
            <UrlTable urls={data?.urls || []} />
            <PaginationControls
                totalItems={data?.total || 0}
                currentPage={page}
                limit={limit}
            />
        </>
      )}
    </div>
  );
}