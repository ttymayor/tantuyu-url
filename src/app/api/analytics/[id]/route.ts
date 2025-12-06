import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUrlById, getUrlAnalytics } from "@/lib/url";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = await getUrlById(id);
  if (!url) {
    return new Response("Not Found", { status: 404 });
  }

  if (url.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const events = await getUrlAnalytics(url.id);

  // Aggregate general stats
  const aggregate = (key: keyof typeof events[0]) => {
    const map = new Map<string, number>();
    events.forEach((e) => {
      const val = String(e[key] || "Unknown");
      map.set(val, (map.get(val) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Aggregate location data for map
  const locationMap = new Map<
    string,
    {
      latitude: number;
      longitude: number;
      city: string;
      country: string;
      count: number;
    }
  >();

  events.forEach((e) => {
    if (e.latitude && e.longitude) {
      // Key by rough coordinates to group same city
      const key = `${e.latitude.toFixed(2)},${e.longitude.toFixed(2)}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          latitude: e.latitude,
          longitude: e.longitude,
          city: e.city || "Unknown",
          country: e.country || "Unknown",
          count: 0,
        });
      }
      locationMap.get(key)!.count++;
    }
  });

  const mapData = Array.from(locationMap.values());

  const chartsData = {
    browsers: aggregate("browser"),
    devices: aggregate("device"),
    os: aggregate("os"),
    countries: aggregate("country"),
  };

  return Response.json({
    eventsCount: events.length,
    chartsData,
    mapData,
    urlInfo: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl
    }
  });
}
