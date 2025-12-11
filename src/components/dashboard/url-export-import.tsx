"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

type URL = {
  id: string;
  originalUrl: string;
  shortCode: string;
  userId: string | null;
  clicks: number;
  description: string | null;
  password: string | null;
  expiresAt: Date | null;
  socialPreview: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

interface UrlExportImportProps {
  onImportSuccess?: () => void;
}

export function UrlExportImport({ onImportSuccess }: UrlExportImportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/urls/batch");
      if (!response.ok) throw new Error("Failed to fetch URLs");
      const urls: URL[] = await response.json();

      if (urls.length === 0) {
        toast.info("No URLs to export");
        return;
      }

      // Convert to CSV
      const headers = [
        "originalUrl",
        "shortCode",
        "clicks",
        "description",
        "createdAt",
      ];
      const csvContent = [
        headers.join(","),
        ...urls.map((url) =>
          [
            `"${url.originalUrl.replace(/"/g, '""')}"`,
            `"${url.shortCode}"`,
            url.clicks,
            `"${(url.description || "").replace(/"/g, '""')}"`,
            `"${new Date(url.createdAt).toISOString()}"`,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `tantuyu_urls_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("URLs exported successfully");
    } catch (error) {
      toast.error("Failed to export URLs");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    try {
      setIsImporting(true);
      const text = await file.text();
      const rows = text
        .split("\n")
        .map((row) => row.trim())
        .filter(Boolean);

      if (rows.length < 2) {
        toast.error("CSV file is empty or missing headers");
        return;
      }

      // Simple CSV parsing
      const headers = rows[0]
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

      const urlIdx = headers.indexOf("originalurl");
      const codeIdx = headers.indexOf("shortcode");
      const descIdx = headers.indexOf("description");

      if (urlIdx === -1) {
        toast.error("CSV must contain 'originalUrl' column");
        return;
      }

      const urlsToImport = [];
      const csvSplitRegex = /,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/;

      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i]
          .split(csvSplitRegex)
          .map((col) => col.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));

        if (columns.length <= urlIdx) continue;

        const originalUrl = columns[urlIdx];
        if (!originalUrl) continue;

        urlsToImport.push({
          originalUrl,
          shortCode: codeIdx !== -1 ? columns[codeIdx] : undefined,
          description: descIdx !== -1 ? columns[descIdx] : undefined,
        });
      }

      if (urlsToImport.length === 0) {
        toast.warning("No valid URLs found in CSV");
        return;
      }

      const response = await fetch("/api/urls/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlsToImport }),
      });

      const result = await response.json();

      if (result.success > 0) {
        toast.success(`Imported ${result.success} URLs successfully`);
        onImportSuccess?.();
      }

      if (result.failed > 0) {
        toast.warning(`Failed to import ${result.failed} URLs`, {
          description:
            "Check console for details or ensure unique short codes.",
        });
        console.warn("Import errors:", result.errors);
      }
    } catch (error) {
      toast.error("Failed to import URLs");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden sm:block">Export</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          disabled={isImporting}
          className="cursor-pointer"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="hidden sm:block">Import</span>
        </Button>
      </ButtonGroup>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
