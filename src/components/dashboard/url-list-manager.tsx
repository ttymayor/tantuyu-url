"use client";

import { useSearchParams } from "next/navigation";
import { UrlTable } from "@/components/dashboard/url-table";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrlExportImport } from "@/components/dashboard/url-export-import";
import { useUrls } from "@/hooks/use-urls";

export function UrlListManager() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const { urls, total, isLoading, isError, mutate } = useUrls({ page, limit });

  if (isError) return <div>Failed to load</div>;

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
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <UrlExportImport onImportSuccess={() => mutate()} />
          {isLoading && !urls.length ? (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          ) : (
            <span className="text-muted-foreground text-sm">
              Total: {total}
            </span>
          )}
        </div>
      </div>

      {isLoading && !urls.length ? (
        <div className="flex h-48 items-center justify-center rounded-md border">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <UrlTable urls={urls} mutate={mutate} />
          <PaginationControls
            totalItems={total}
            currentPage={page}
            limit={limit}
          />
        </>
      )}
    </div>
  );
}