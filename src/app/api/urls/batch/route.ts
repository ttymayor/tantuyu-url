import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createShortUrl, getAllUserUrls } from "@/lib/url";

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const urls = await getAllUserUrls(session.user.id);
    return Response.json(urls);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls)) {
      return new Response("Invalid data format", { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const urlData of urls) {
      if (!urlData.originalUrl) {
        results.failed++;
        results.errors.push("Missing originalUrl");
        continue;
      }

      try {
        await createShortUrl(
          urlData.originalUrl,
          session.user.id,
          urlData.shortCode || undefined,
          {
            description: urlData.description,
          },
        );
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to create ${urlData.originalUrl}: ${error}`,
        );
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error("Batch import error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
