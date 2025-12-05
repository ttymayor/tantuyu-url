"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import { updateUrlAction } from "@/app/dashboard/actions";

interface EditUrlSheetProps {
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
  };
}

export function EditUrlSheet({ url }: EditUrlSheetProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await updateUrlAction(url.id, formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit URL</SheetTitle>
          <SheetDescription>
            Make changes to your short URL here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Original URL</Label>
            <Input
              id="url"
              name="url"
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
