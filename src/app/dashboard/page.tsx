import { CreateUrlForm } from "@/components/dashboard/create-url-form";
import { UrlTable } from "@/components/dashboard/url-table";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserUrls, getUserUrlsCount } from "@/lib/url";

export default async function DashboardPage(props: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  const [userUrls, totalItems] = await Promise.all([
    getUserUrls(session.user.id, page, limit),
    getUserUrlsCount(session.user.id),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-20vh)] w-full flex-col items-center gap-8 p-4">
      <CreateUrlForm />

      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent URLs</h2>
          <span className="text-sm text-muted-foreground">
            Total: {totalItems}
          </span>
        </div>
        
        <UrlTable urls={userUrls} />
        
        <PaginationControls
          totalItems={totalItems}
          currentPage={page}
          limit={limit}
        />
      </div>
    </div>
  );
}