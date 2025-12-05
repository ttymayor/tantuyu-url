"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditUrlSheet } from "@/components/dashboard/edit-url-sheet";

interface UrlTableProps {
  urls: {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: Date;
  }[];
}

export function UrlTable({ urls }: UrlTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Short Code</TableHead>
            <TableHead className="max-w-[400px]">Original URL</TableHead>
            <TableHead className="w-[100px] text-right">Clicks</TableHead>
            <TableHead className="w-[200px] text-right">Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No URLs found.
              </TableCell>
            </TableRow>
          ) : (
            urls.map((url) => (
              <TableRow key={url.id}>
                <TableCell className="font-medium">
                  <a
                    href={`/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {url.shortCode}
                  </a>
                </TableCell>
                <TableCell className="max-w-[400px] truncate" title={url.originalUrl}>
                  {url.originalUrl}
                </TableCell>
                <TableCell className="text-right">{url.clicks}</TableCell>
                <TableCell className="text-right">
                  {url.createdAt.toLocaleString()}
                </TableCell>
                <TableCell>
                  <EditUrlSheet
                    url={{
                      id: url.id,
                      originalUrl: url.originalUrl,
                      shortCode: url.shortCode,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
