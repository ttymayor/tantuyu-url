"use client";

import { useRef, useState } from "react";
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
  Hash,
  Pen,
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUrlRefresher } from "@/hooks/use-urls";

export function CreateUrlForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const refreshUrls = useUrlRefresher();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (date) {
      // Append date to formData in ISO format or however the server expects it
      // The server action expects "expiresAt" string which is parsed by new Date()
      // Let's ensure we send an ISO string.
      formData.set("expiresAt", date.toISOString());
    }

    const result = await shorten(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      if (formRef.current) formRef.current.reset();
      setDate(undefined);
      setIsOpen(false);
      refreshUrls();
    }
  }

  return (
    <form
      ref={formRef}
      id="create-url-form"
      action={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-4"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2">
          <InputGroup className="flex-1">
            <InputGroupInput
              id="shortUrl"
              type="url"
              placeholder="輸入網址（e.g. https://example.com）"
              name="url"
              required
            />
            <InputGroupAddon>
              <LinkIcon />
            </InputGroupAddon>
          </InputGroup>
          <InputGroup className="w-auto sm:w-1/4">
            <InputGroupInput
              id="customCode"
              type="text"
              placeholder="自訂代碼（選填）"
              name="customCode"
            />
            <InputGroupAddon>
              <Hash />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <InputGroup className="flex-1">
          <InputGroupInput
            id="description"
            placeholder="說明（選填）"
            name="description"
          />
          <InputGroupAddon>
            <Pen />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2"
      >
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground flex w-full cursor-pointer items-center justify-center gap-2 sm:w-auto sm:justify-start"
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              進階設定（密碼保護、過期時間）
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="bg-muted/20 space-y-4 rounded-md border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> 密碼保護（選填）
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="設定存取密碼"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> 過期時間（選填）
              </Label>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="socialPreview"
              name="socialPreview"
              className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="socialPreview"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                啟用社群預覽（Social Preview）
              </Label>
              <p className="text-muted-foreground text-xs">
                讓機器人抓取自訂標題（使用上方說明欄位），而不是直接重導向。
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Button
        type="submit"
        disabled={loading}
        size="sm"
        className="w-full cursor-pointer sm:w-auto"
      >
        {loading ? (
          <Hammer className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Hammer className="mr-2 h-4 w-4" />
        )}
        建立短網址
      </Button>

      {error && <p className="px-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}
