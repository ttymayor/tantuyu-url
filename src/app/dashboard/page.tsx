import { CreateUrlForm } from "@/components/dashboard/create-url-form";
import { UrlListManager } from "@/components/dashboard/url-list-manager";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-20vh)] w-full flex-col items-center gap-8 p-4">
      <CreateUrlForm />
      <UrlListManager />
    </div>
  );
}
