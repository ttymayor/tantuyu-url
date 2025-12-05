"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  limit: number;
}

export function PaginationControls({
  totalItems,
  currentPage,
  limit,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / limit);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1"); // Reset to page 1 when limit changes
    router.push(`?${params.toString()}`);
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between w-full py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              {limit}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={limit.toString()}
              onValueChange={handleLimitChange}
            >
              {[5, 10, 20, 50, 100].map((val) => (
                <DropdownMenuRadioItem key={val} value={val.toString()}>
                  {val}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex justify-end">
         <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        aria-disabled={currentPage <= 1}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
                
                {/* Simplified pagination for now: Just showing current page context if needed, 
                    but shadcn pagination typically lists numbers. 
                    For brevity, I'll show just prev/next and maybe current page? 
                    Let's render a simple range or just prev/next + text for now to avoid complex logic.
                    Actually, let's just show Page X of Y text in the middle?
                    Standard UI usually lists numbers. Let's do a simple numbered list if totalPages <= 5.
                */}
                
                <PaginationItem>
                    <span className="flex h-9 items-center justify-center px-4 text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                </PaginationItem>

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        aria-disabled={currentPage >= totalPages}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
         </Pagination>
      </div>
    </div>
  );
}
