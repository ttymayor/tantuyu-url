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
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface EditUrlDialogProps {
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
    description?: string | null;
    password?: string | null;
    expiresAt?: Date | null;
    socialPreview: boolean;
  };
  mutate: () => void;
}

function EditUrlForm({
  url,
  mutate,
  setOpen,
}: {
  url: EditUrlDialogProps["url"];
  mutate: () => void;
  setOpen: (open: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    url.expiresAt ? new Date(url.expiresAt) : undefined,
  );
  const [socialPreview, setSocialPreview] = useState<boolean>(
    url.socialPreview,
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (date) formData.set("expiresAt", date.toISOString());

    const result = await updateUrlAction(url.id, formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("URL updated successfully");
      setOpen(false);
      mutate();
    }
  }

  return (
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
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="socialPreview"
          checked={socialPreview}
          onCheckedChange={() => setSocialPreview(!socialPreview)}
          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
        />
        {socialPreview && (
          <input type="hidden" name="socialPreview" value="on" />
        )}
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="socialPreview"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Enable Social Preview
          </Label>
          <p className="text-muted-foreground text-xs">
            Allows bots to fetch custom title from description.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" className="cursor-pointer">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditUrlDialog({ url, mutate }: EditUrlDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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
        <EditUrlForm
          url={url}
          mutate={mutate}
          setOpen={setOpen}
          key={JSON.stringify(url)}
        />
      </DialogContent>
    </Dialog>
  );
}
