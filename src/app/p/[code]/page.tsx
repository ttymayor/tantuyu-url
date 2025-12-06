"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { verifyPassword } from "./actions";
import { Lock } from "lucide-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function PasswordPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { code } = use(params);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await verifyPassword(code, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success && result.redirectUrl) {
      // Redirect via client side to avoid server action redirect limitations or just clear state
      window.location.href = result.redirectUrl;
    }
  }

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <FlickeringGrid className="absolute inset-0 z-0" />

      <h2 className="relative z-10 text-center text-2xl font-bold">
        tantuyu 的短網址
      </h2>
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="text-primary h-5 w-5" />
            <CardTitle>密碼保護的網址</CardTitle>
          </div>
          <CardDescription>
            這個連結是密碼保護的。請輸入密碼以繼續。
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit} className="space-y-4">
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="請輸入密碼"
                className={error ? "border-red-500" : ""}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "驗證中..." : "解鎖"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
