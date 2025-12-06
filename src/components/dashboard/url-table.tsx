"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditUrlDialog } from "@/components/dashboard/edit-url-dialog";
import { DeleteUrlDialog } from "@/components/dashboard/delete-url-dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, BarChart2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface UrlTableProps {
  urls: {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: Date;
    description?: string | null;
    password?: string | null;
    expiresAt?: Date | null;
    socialPreview: boolean;
  }[];
  mutate: () => void;
}

function CopyButton({ shortCode }: { shortCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const fullUrl = `${BASE_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="sr-only">Copy URL</span>
    </Button>
  );
}

export function UrlTable({ urls, mutate }: UrlTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[150px]">Short Code</TableHead>
            <TableHead className="max-w-[300px]">Original URL</TableHead>
            <TableHead className="w-[50px] text-right">Clicks</TableHead>
            <TableHead className="w-[150px] text-right">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-24 text-center"
              >
                No URLs found.
              </TableCell>
            </TableRow>
          ) : (
            urls.map((url) => (
              <TableRow key={url.id}>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <CopyButton shortCode={url.shortCode} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href={`/dashboard/analytics/${url.id}`}>
                        <BarChart2 className="h-4 w-4" />
                        <span className="sr-only">Analytics</span>
                      </Link>
                    </Button>
                    <EditUrlDialog
                      url={{
                        id: url.id,
                        originalUrl: url.originalUrl,
                        shortCode: url.shortCode,
                        description: url.description,
                        password: url.password,
                        expiresAt: url.expiresAt
                          ? new Date(url.expiresAt)
                          : null,
                        socialPreview: url.socialPreview,
                      }}
                      mutate={mutate}
                    />
                    <DeleteUrlDialog
                      url={{
                        id: url.id,
                        shortCode: url.shortCode,
                      }}
                      mutate={mutate}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${url.shortCode}`}
                        className="text-primary font-mono hover:underline"
                        prefetch={false}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url.shortCode}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className="max-w-[300px] truncate"
                  title={url.originalUrl}
                >
                  <Link
                    href={url.originalUrl}
                    className="text-primary hover:underline"
                    prefetch={false}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url.originalUrl}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{url.clicks}</TableCell>
                <TableCell
                  className="text-right"
                  title={new Date(url.createdAt).toLocaleString()}
                >
                  {formatDistanceToNow(new Date(url.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
