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

  // Time Series Aggregation
  const groupByTime = (startDate: Date, unit: 'hour' | 'day' | 'month') => {
    const data = new Map<string, number>();
    const start = new Date(startDate);
    const end = new Date();

    // Normalize start time based on unit
    // if (unit === 'hour') start.setMinutes(0, 0, 0);
    // if (unit === 'day') start.setHours(0, 0, 0, 0);
    // if (unit === 'month') start.setDate(1); start.setHours(0, 0, 0, 0);

    // Initialize all slots with 0
    const current = new Date(start);
    while (current <= end) {
      let key = '';
      if (unit === 'hour') key = current.toISOString().slice(0, 13) + ':00'; // YYYY-MM-DDTHH:00
      if (unit === 'day') key = current.toISOString().slice(0, 10); // YYYY-MM-DD
      if (unit === 'month') key = current.toISOString().slice(0, 7); // YYYY-MM
      
      data.set(key, 0);
      
      // Increment
      if (unit === 'hour') current.setTime(current.getTime() + 60 * 60 * 1000);
      if (unit === 'day') current.setDate(current.getDate() + 1);
      if (unit === 'month') current.setMonth(current.getMonth() + 1);
    }

    // Fill with actual data
    events.forEach(e => {
        const d = new Date(e.createdAt!); // Ensure createdAt is treated as Date
        if (d >= startDate) {
             let key = '';
            if (unit === 'hour') key = d.toISOString().slice(0, 13) + ':00';
            if (unit === 'day') key = d.toISOString().slice(0, 10);
            if (unit === 'month') key = d.toISOString().slice(0, 7);
            
            if (data.has(key)) {
                data.set(key, (data.get(key) || 0) + 1);
            }
        }
    });

    return Array.from(data.entries()).map(([date, value]) => ({ date, value }));
  };

  const now = new Date();
  const timeSeries = {
    last24Hours: groupByTime(new Date(now.getTime() - 24 * 60 * 60 * 1000), 'hour'),
    last7Days: groupByTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 'day'),
    last30Days: groupByTime(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 'day'),
    lastYear: groupByTime(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), 'month'),
  };

  return Response.json({
    eventsCount: events.length,
    chartsData,
    mapData,
    timeSeries,
    urlInfo: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl
    }
  });
}
