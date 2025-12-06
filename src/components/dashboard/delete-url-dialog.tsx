"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteUrlAction } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface DeleteUrlDialogProps {
  url: {
    id: string;
    shortCode: string;
  };
}

export function DeleteUrlDialog({ url }: DeleteUrlDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  async function handleDelete() {
    setLoading(true);

    const result = await deleteUrlAction(url.id);

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("URL deleted successfully");
      setOpen(false);
      // Invalidate SWR cache for URLs to refresh the list
      mutate(
        (key) => typeof key === "string" && key.startsWith("/api/urls"),
        undefined,
        { revalidate: true }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete URL</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the short URL <strong>{url.shortCode}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
