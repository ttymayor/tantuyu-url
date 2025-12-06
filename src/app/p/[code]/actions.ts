"use server";

import { getUrlByCode, recordClick } from "@/lib/url";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function verifyPassword(code: string, formData: FormData) {
  const inputPassword = formData.get("password") as string;
  const record = await getUrlByCode(code);

  if (!record) {
    return { error: "URL not found" };
  }

  if (record.password !== inputPassword) {
    return { error: "Incorrect password" };
  }
  
  // Password correct. We should record the click now because we are about to redirect.
  // However, `recordClick` logic is duplicated here from `route.ts`.
  // Ideally we extract the analytics logic to a shared function but it depends on `request`.
  // For now, we will try to mimic the analytics recording here or just redirect.
  // Wait, if we redirect to the original URL, the `route.ts` will catch it again?
  // NO. `route.ts` handles `/[code]`. The original URL is external (e.g. google.com).
  // So yes, we must record the click here before redirecting to `record.originalUrl`.

  const reqHeaders = await headers();
  const uaString = reqHeaders.get("user-agent") || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  const referrer = reqHeaders.get("referer") || null;

  // Geo (IPinfo) - Duplicate logic...
  let country = null;
  let city = null;
  let latitude = null;
  let longitude = null;

  let ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "8.8.8.8";
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

  return { success: true, redirectUrl: record.originalUrl };
}
