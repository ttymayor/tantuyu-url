import { sqliteTable, text, integer, index, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Auth Tables (Better Auth Standard Schema) ---

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- App Specific Tables ---

export const urls = sqliteTable("url", {
  id: text("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  clicks: integer("clicks").default(0).notNull(),
  description: text("description"),
  password: text("password"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  socialPreview: integer("social_preview", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()) 
    .notNull(),
}, (table) => ({
  shortCodeIdx: index("idx_url_short_code").on(table.shortCode),
  userIdIdx: index("idx_url_user_id").on(table.userId),
}));

export const urlEvents = sqliteTable("url_event", {
  id: text("id").primaryKey(),
  urlId: text("url_id").notNull().references(() => urls.id, { onDelete: "cascade" }),
  browser: text("browser"),
  device: text("device"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  referrer: text("referrer"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
}, (table) => ({
  urlIdIdx: index("idx_event_url_id").on(table.urlId),
}));