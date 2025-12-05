"use client";

import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Link as LinkIcon, Hammer } from "lucide-react";
import { shorten } from "@/app/dashboard/actions";

export function CreateUrlForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    // Using the action directly.
    // Note: If you use useActionState hook in React 19, it handles loading/error better.
    // For now, manual handling.
    
    const result = await shorten(null, formData);
    setLoading(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
       // clear form
       const form = document.getElementById("create-url-form") as HTMLFormElement;
       if (form) form.reset();
    }
  }

  return (
    <form id="create-url-form" action={handleSubmit} className="w-full max-w-2xl flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1">
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
        </div>
        
        <div className="w-full sm:w-[200px]">
             <InputGroup className="w-full">
                <InputGroupInput
                    id="customCode"
                    type="text"
                    placeholder="自訂代碼 (選填)"
                    name="customCode"
                />
                 <InputGroupAddon align={"inline-end"}>
                    <InputGroupButton size={"icon-sm"} type="submit" disabled={loading}>
                        <Hammer />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
      </div>
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}
    </form>
  );
}
