import { recordClick } from "@/lib/url";
import { UAParser } from "ua-parser-js";

export async function trackUrlVisit(
  urlId: string,
  headers: { get(name: string): string | null },
) {
  const uaString = headers.get("user-agent") || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  const referrer = headers.get("referer") || null;

  let ip = headers.get("x-forwarded-for")?.split(",")[0] || "8.8.8.8";
  // Fallback for local development
  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "8.8.8.8";
  }

  // Geo (IPinfo)
  let country = null;
  let city = null;
  let latitude = null;
  let longitude = null;

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

  await recordClick(urlId, {
    browser: result.browser.name || "Unknown",
    device: result.device.type || "Desktop",
    os: result.os.name || "Unknown",
    country,
    city,
    latitude,
    longitude,
    referrer,
  });
}
