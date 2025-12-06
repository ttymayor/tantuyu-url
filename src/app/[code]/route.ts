import { getUrlByCode } from "@/lib/url";
import { trackUrlVisit } from "@/lib/analytics";
import { redirect } from "next/navigation";
import { constructUrl } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const code = (await params).code;

  // Ignore common bot/browser files that might slip through
  if (code === "favicon.ico" || code === "robots.txt") {
    return new Response("Not Found", { status: 404 });
  }

  const record = await getUrlByCode(code);

  if (!record) {
    return redirect("/404");
  }

  // Check Expiration
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return redirect("/link-expired");
  }

  // Don't record analytics for HEAD requests (previews, pinging)
  if (request.method === "HEAD") {
    // For HEAD requests, we might still want to enforce password protection?
    // Technically yes, but for simplicity let's redirect to login page if protected.
    if (record.password) {
      // We cannot easily render a page here.
      // Redirect to password page path
      return redirect(constructUrl(`/p/${code}`));
    }
    return redirect(record.originalUrl);
  }

  // Don't record analytics for Next.js prefetches
  const purpose =
    request.headers.get("purpose") || request.headers.get("sec-purpose");
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("x-next-router-prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    purpose === "prefetch";

  if (isPrefetch) {
    // Even prefetch should not bypass password
    if (record.password) {
      // Redirect to password page
      return redirect(constructUrl(`/p/${code}`));
    }
    return redirect(record.originalUrl);
  }

  // Check Password Protection
  if (record.password) {
    // We need to redirect the user to a password entry page
    // We will pass the target code as a param
    return redirect(constructUrl(`/p/${code}`));
  }

  // --- Social Preview Interception ---
  if (record.socialPreview) {
    const ua = request.headers.get("user-agent") || "";
    const isBot = /facebookexternalhit|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|pinterest|skypeuripreview/i.test(ua);

    if (isBot) {
      const title = record.description || "Short URL";
      const description = `Click to visit ${record.originalUrl}`;
      
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:url" content="${record.originalUrl}">
          <meta property="og:type" content="website">
          <meta name="twitter:card" content="summary">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <title>${title}</title>
        </head>
        <body>
          <script>window.location.href = "${record.originalUrl}";</script>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // --- Analytics Recording ---
  await trackUrlVisit(record.id, request.headers);

  return redirect(record.originalUrl);
}
