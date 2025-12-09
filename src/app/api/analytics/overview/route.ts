import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { urls, urlEvents } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // 1. Total Links Count
  const [linksResult] = await db
    .select({ count: count() })
    .from(urls)
    .where(eq(urls.userId, userId));

  // 2. Total Clicks (All time)
  const [totalClicksResult] = await db
    .select({ count: count() })
    .from(urlEvents)
    .innerJoin(urls, eq(urlEvents.urlId, urls.id))
    .where(eq(urls.userId, userId));

  // 3. Events for Growth Rate (Last 14 days) & Chart (Last 1 year)
  // We fetch last year's events for the chart. This covers the 14 days needed for growth rate too.
  const events = await db
    .select({
      createdAt: urlEvents.createdAt,
    })
    .from(urlEvents)
    .innerJoin(urls, eq(urlEvents.urlId, urls.id))
    .where(
      and(
        eq(urls.userId, userId),
        gte(urlEvents.createdAt, oneYearAgo)
      )
    );

  // Growth Rate Logic (using events array)
  const currentPeriodClicks = events.filter(
    (e) => e.createdAt! >= sevenDaysAgo
  ).length;

  const previousPeriodClicks = events.filter(
    (e) => e.createdAt! >= fourteenDaysAgo && e.createdAt! < sevenDaysAgo
  ).length;

  let growthRate = 0;
  if (previousPeriodClicks > 0) {
    growthRate =
      ((currentPeriodClicks - previousPeriodClicks) / previousPeriodClicks) *
      100;
  } else if (currentPeriodClicks > 0) {
    growthRate = 100;
  }

  // Time Series Aggregation (Logic reused from [id]/route.ts)
  const groupByTime = (startDate: Date, unit: 'hour' | 'day' | 'month') => {
    const data = new Map<string, number>();
    const start = new Date(startDate);
    const end = new Date();

    const current = new Date(start);
    while (current <= end) {
      let key = '';
      if (unit === 'hour') key = current.toISOString().slice(0, 13) + ':00';
      if (unit === 'day') key = current.toISOString().slice(0, 10);
      if (unit === 'month') key = current.toISOString().slice(0, 7);
      
      data.set(key, 0);
      
      if (unit === 'hour') current.setTime(current.getTime() + 60 * 60 * 1000);
      if (unit === 'day') current.setDate(current.getDate() + 1);
      if (unit === 'month') current.setMonth(current.getMonth() + 1);
    }

    events.forEach(e => {
        const d = new Date(e.createdAt!);
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

  const timeSeries = {
    last24Hours: groupByTime(new Date(now.getTime() - 24 * 60 * 60 * 1000), 'hour'),
    last7Days: groupByTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 'day'),
    last30Days: groupByTime(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 'day'),
    lastYear: groupByTime(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), 'month'),
  };

  return Response.json({
    totalLinks: linksResult.count,
    totalClicks: totalClicksResult.count,
    currentPeriodClicks,
    previousPeriodClicks,
    growthRate,
    timeSeries,
  });
}
