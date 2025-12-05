import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { count } from "drizzle-orm";
import { SignIn } from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  const [userCount] = await db.select({ count: count() }).from(user);
  const hasUser = userCount && userCount.count > 0;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-primary text-3xl font-bold">Tantuyu URL</h1>
          <p className="text-muted-foreground">
            {hasUser
              ? "Welcome back"
              : "Get started by creating your admin account"}
          </p>
        </div>
        {hasUser ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
}
