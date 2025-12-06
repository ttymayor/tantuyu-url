import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getUrlById } from "@/lib/url";
import { AnalyticsView } from "@/components/dashboard/analytics-view";

export default async function AnalyticsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const url = await getUrlById(params.id);
  if (!url) notFound();
  if (url.userId !== session.user.id) {
      return <div className="p-4">Unauthorized</div>;
  }

  // Pass only the ID, let the client component handle data fetching via SWR
  return <AnalyticsView urlId={url.id} />;
}
