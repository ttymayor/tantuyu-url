import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserUrls, getUserUrlsCount } from "@/lib/url";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  try {
    const [urls, total] = await Promise.all([
      getUserUrls(session.user.id, page, limit),
      getUserUrlsCount(session.user.id),
    ]);

    return Response.json({ urls, total });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
