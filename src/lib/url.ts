import { db } from "@/lib/db";
import { urls } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, sql, and, ne, desc, count } from "drizzle-orm";

export const createShortUrl = async (originalUrl: string, userId?: string, customCode?: string) => {
  const shortCode = customCode || nanoid(6);
  
  if (customCode) {
    const existing = await db.select().from(urls).where(eq(urls.shortCode, customCode)).limit(1);
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return shortCode;
};

export const getUrlByCode = async (code: string) => {
  const result = await db.select().from(urls).where(eq(urls.shortCode, code)).limit(1);
  return result[0];
};

export const updateShortUrl = async (id: string, userId: string, data: { originalUrl: string; shortCode: string }) => {
  const [existing] = await db.select().from(urls).where(eq(urls.id, id)).limit(1);
  
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

  await db.update(urls)
    .set({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      updatedAt: new Date(),
    })
    .where(eq(urls.id, id));
};

export const incrementClicks = async (id: string) => {
  await db.update(urls)
    .set({ 
      clicks: sql`clicks + 1`,
      updatedAt: new Date() 
    })
    .where(eq(urls.id, id));
};

export const getUserUrls = async (userId: string, page: number = 1, pageSize: number = 10) => {
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
