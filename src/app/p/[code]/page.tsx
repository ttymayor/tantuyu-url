"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verifyPassword } from "./actions";
import { Lock } from "lucide-react";

export default function PasswordPage({ params }: { params: Promise<{ code: string }> }) {
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
             <Lock className="h-5 w-5 text-primary" />
             <CardTitle>Protected URL</CardTitle>
          </div>
          <CardDescription>
            This link is password protected. Please enter the password to continue.
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
            <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required placeholder="Enter password" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Unlock"}
            </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
