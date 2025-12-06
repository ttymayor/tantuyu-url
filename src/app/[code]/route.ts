import { getUrlByCode, recordClick } from "@/lib/url";
import { redirect } from "next/navigation";
import { UAParser } from "ua-parser-js";

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
    return new Response("Not Found", { status: 404 });
  }

  // Check Expiration
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return new Response("This URL has expired.", { status: 410 }); // 410 Gone
  }

  // Don't record analytics for HEAD requests (previews, pinging)
  if (request.method === "HEAD") {
      // For HEAD requests, we might still want to enforce password protection?
      // Technically yes, but for simplicity let's redirect to login page if protected.
      if (record.password) {
         // We cannot easily render a page here.
         // Redirect to password page path
         const host = request.headers.get("host") || "";
         const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
         return redirect(`${protocol}://${host}/p/${code}`);
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
         const host = request.headers.get("host") || "";
         const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
         return redirect(`${protocol}://${host}/p/${code}`);
    }
    return redirect(record.originalUrl);
  }

  // Check Password Protection
  if (record.password) {
      // We need to redirect the user to a password entry page
      // We will pass the target code as a param
      const host = request.headers.get("host") || "";
      const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
      return redirect(`${protocol}://${host}/p/${code}`);
  }

  // --- Analytics Recording ---

  // Parse User Agent
  const uaString = request.headers.get("user-agent") || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  const referrer = request.headers.get("referer") || null;

  // Geo (IPinfo)
  let country = null;
  let city = null;
  let latitude = null;
  let longitude = null;

  let ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "8.8.8.8";

  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "8.8.8.8";
  }

  const token = process.env.IPINFO_TOKEN;

  if (token) {
    try {
      const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`);

      if (res.ok) {
        const data = await res.json();
        country = data.country;
        city = data.city;
        if (data.loc) {
          const [lat, lon] = data.loc.split(",");
          latitude = parseFloat(lat);
          longitude = parseFloat(lon);
        }
      }
    } catch (e) {
      console.error("Error fetching IP info:", e);
    }
  }

  await recordClick(record.id, {
    browser: result.browser.name || "Unknown",
    device: result.device.type || "Desktop",
    os: result.os.name || "Unknown",
    country,
    city,
    latitude,
    longitude,
    referrer,
  });

  return redirect(record.originalUrl);
}