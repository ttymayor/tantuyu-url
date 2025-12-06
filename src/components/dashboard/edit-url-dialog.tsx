"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pencil, CalendarIcon } from "lucide-react";
import { updateUrlAction } from "@/app/dashboard/actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditUrlDialogProps {
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
    description?: string | null;
    password?: string | null;
    expiresAt?: Date | null;
  };
}

export function EditUrlDialog({ url }: EditUrlDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    url.expiresAt ? new Date(url.expiresAt) : undefined,
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (date) {
      formData.set("expiresAt", date.toISOString());
    } else {
      // If date is undefined (cleared), we need to explicitly send empty string or something to indicate removal?
      // The server action checks `expiresAtRaw ? new Date(expiresAtRaw) : undefined`.
      // If we don't set it, it might be undefined in formData.get() (returns null).
      // If we want to clear it, we should probably send an empty string if the intention is to clear.
      // But the current server logic: `expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined`
      // If it's undefined, it keeps it as undefined (which might mean "don't change" in some update logics, but here it's passed to `db.update`).
      // Wait, `db.update` replaces the value.
      // So `undefined` in the update object might be ignored by drizzle or set to null?
      // Drizzle `update(table).set({...})` keys with `undefined` are usually ignored.
      // Keys with `null` set the column to NULL.
      // Our server action does: `expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined`.
      // If `expiresAtRaw` is missing/empty, it passes `undefined`.
      // So Drizzle ignores it, meaning the old value persists.
      // This is a bug if we want to remove the expiration date!

      // FIX: If user cleared the date, we need to pass null to the DB.
      // Let's make sure the server action handles "clearing".
      // For now, if `date` is undefined, let's assume we want to clear it if it was previously set.
      // But `formData` behavior: if I don't append it, it's null.
      // We need to signal "remove date".
      // Let's append an empty string if date is undefined.
      if (!date) {
        formData.set("expiresAt", "");
      }
    }

    const result = await updateUrlAction(url.id, formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit URL</DialogTitle>
          <DialogDescription>
            Make changes to your short URL here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Original URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={url.originalUrl}
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shortCode">Short Code</Label>
            <Input
              id="shortCode"
              name="shortCode"
              defaultValue={url.shortCode}
              placeholder="custom-code"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={url.description || ""}
              placeholder="Optional description"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue={url.password || ""}
              placeholder="Leave empty to keep current or remove"
            />
            <p className="text-muted-foreground text-[0.8rem]">
              Warning: Saving empty will remove/overwrite the password.
            </p>
          </div>
          <div className="flex grid flex-col gap-2">
            <Label className="mb-2">Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
