"use client";

import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Link as LinkIcon,
  Hammer,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  Lock,
} from "lucide-react";
import { shorten } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function CreateUrlForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    if (date) {
      // Append date to formData in ISO format or however the server expects it
      // The server action expects "expiresAt" string which is parsed by new Date()
      // Let's ensure we send an ISO string.
      formData.set("expiresAt", date.toISOString());
    }

    const result = await shorten(null, formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // clear form
      const form = document.getElementById(
        "create-url-form",
      ) as HTMLFormElement;
      if (form) form.reset();
      setDate(undefined); // Reset date
      setIsOpen(false); // Close advanced options on success
    }
  }

  return (
    <form
      id="create-url-form"
      action={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-4"
    >
      <div className="flex w-full flex-col gap-2">
        <InputGroup className="w-full">
          <InputGroupInput
            id="shortUrl"
            type="url"
            placeholder="輸入網址 (e.g. https://example.com)"
            name="url"
            required
          />
          <InputGroupAddon>
            <LinkIcon />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <InputGroup className="flex-1">
            <InputGroupInput
              id="customCode"
              type="text"
              placeholder="自訂代碼 (選填)"
              name="customCode"
            />
          </InputGroup>
          <InputGroup className="flex-1">
            <InputGroupInput
              id="description"
              type="text"
              placeholder="說明 (選填)"
              name="description"
            />
          </InputGroup>
        </div>
      </div>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-start"
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              進階設定 (密碼保護、過期時間)
            </Button>
          </CollapsibleTrigger>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Hammer className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Hammer className="mr-2 h-4 w-4" />
            )}
            建立短網址
          </Button>
        </div>
        <CollapsibleContent className="bg-muted/20 space-y-4 rounded-md border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> 密碼保護 (選填)
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="設定存取密碼"
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4" /> 過期時間 (選填)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {/* Hidden input to submit the date via FormData if js is disabled? 
                  Actually handleSubmit handles it manually. 
                  But if we want it to work without JS (progressive enhancement), we need a hidden input.
                  However, Calendar component requires JS. So manual handling in handleSubmit is fine.
              */}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {error && <p className="px-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}