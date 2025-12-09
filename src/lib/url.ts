import { db } from "@/lib/db";
import { urls, urlEvents } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, sql, and, ne, desc, count } from "drizzle-orm";

export const createShortUrl = async (
  originalUrl: string,
  userId?: string,
  customCode?: string,
  options?: {
    description?: string;
    password?: string;
    expiresAt?: Date;
    socialPreview?: boolean;
  },
) => {
  const shortCode = customCode || nanoid(6);

  if (customCode) {
    const existing = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, customCode))
      .limit(1);
    if (existing.length > 0) {
      throw new Error("Short code already in use");
    }
  }

  await db.insert(urls).values({
    id: nanoid(),
    originalUrl,
    shortCode,
    userId: userId || null,
    clicks: 0,
    description: options?.description || null,
    password: options?.password || null,
    expiresAt: options?.expiresAt || null,
    socialPreview: options?.socialPreview || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return shortCode;
};

export const getUrlByCode = async (code: string) => {
  const result = await db
    .select()
    .from(urls)
    .where(eq(urls.shortCode, code))
    .limit(1);
  return result[0];
};

export const getUrlById = async (id: string) => {
  const result = await db.select().from(urls).where(eq(urls.id, id)).limit(1);
  return result[0];
};

export const updateShortUrl = async (
  id: string,
  userId: string,
  data: {
    originalUrl: string;
    shortCode: string;
    description?: string | null;
    password?: string | null;
    expiresAt?: Date | null;
    socialPreview?: boolean;
  },
) => {
  const [existing] = await db
    .select()
    .from(urls)
    .where(eq(urls.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("URL not found");
  }

  if (existing.userId !== userId) {
    throw new Error("Unauthorized");
  }

  if (data.shortCode !== existing.shortCode) {
    const [codeExists] = await db
      .select()
      .from(urls)
      .where(and(eq(urls.shortCode, data.shortCode), ne(urls.id, id)))
      .limit(1);

    if (codeExists) {
      throw new Error("Short code already in use");
    }
  }

  await db
    .update(urls)
    .set({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      description: data.description || null,
      password: data.password || null,
      expiresAt: data.expiresAt || null,
      socialPreview: data.socialPreview || false,
      updatedAt: new Date(),
    })
    .where(eq(urls.id, id));
};

export const recordClick = async (
  urlId: string,
  data: {
    browser?: string | null;
    device?: string | null;
    os?: string | null;
    country?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    referrer?: string | null;
  },
) => {
  await db.insert(urlEvents).values({
    id: nanoid(),
    urlId,
    ...data,
    createdAt: new Date(),
  });

  await db
    .update(urls)
    .set({
      clicks: sql`clicks + 1`,
      updatedAt: new Date(),
    })
    .where(eq(urls.id, urlId));
};

export const getUserUrls = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
) => {
  const offset = (page - 1) * pageSize;
  return await db
    .select()
    .from(urls)
    .where(eq(urls.userId, userId))
    .orderBy(desc(urls.createdAt))
    .limit(pageSize)
    .offset(offset);
};

export const getUserUrlsCount = async (userId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(urls)
    .where(eq(urls.userId, userId));
  return result?.count || 0;
};

export const getUrlAnalytics = async (urlId: string) => {
  const events = await db
    .select()
    .from(urlEvents)
    .where(eq(urlEvents.urlId, urlId));
  return events;
};

export const getRecentClicks = async (urlId: string) => {
  const events = await db
    .select()
    .from(urlEvents)
    .where(eq(urlEvents.urlId, urlId))
    .orderBy(desc(urlEvents.createdAt))
    .limit(10);
  return events;
};

/**
 *
 * @param userId - User ID to get growth rate for
 * @param urlId - Optional URL ID to get growth rate for
 * @param range - Number of days to look back
 * @returns
 */
export const getRecentGrowthRate = async (
  userId: string,
  urlId?: string,
  range?: number,
): Promise<number> => {
  if (range === undefined) {
    range = 1;
  } else if (range < 1) {
    throw new Error("Range must be greater than 0");
  }

  const [result] = await db
    .select({ count: count() })
    .from(urls)
    .where(eq(urls.userId, userId))
    .limit(1);

  if (!result) {
    throw new Error("User not found");
  }

  // 如果沒有 urlId 則取得該用戶所有 URL 的點擊次數
  if (!urlId) {
    const [recentClicks] = await db
      .select({ count: count() })
      .from(urlEvents)
      .orderBy(desc(urlEvents.createdAt))
      .limit(1);

    const [previousClicks] = await db
      .select({ count: count() })
      .from(urlEvents)
      .orderBy(desc(urlEvents.createdAt))
      .limit(range);

    const growthRate =
      (recentClicks.count - previousClicks.count) / previousClicks.count;

    return growthRate;
  }

  const [recentClicks] = await db
    .select({ count: count() })
    .from(urlEvents)
    .where(eq(urlEvents.urlId, urlId))
    .orderBy(desc(urlEvents.createdAt))
    .limit(1);

  const [previousClicks] = await db
    .select({ count: count() })
    .from(urlEvents)
    .where(eq(urlEvents.urlId, urlId))
    .orderBy(desc(urlEvents.createdAt))
    .limit(range);

  const growthRate =
    (recentClicks.count - previousClicks.count) / previousClicks.count;

  return growthRate;
};

export const deleteUrl = async (id: string, userId: string) => {
  const [existing] = await db
    .select()
    .from(urls)
    .where(eq(urls.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("URL not found");
  }

  if (existing.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.delete(urls).where(eq(urls.id, id));
};
