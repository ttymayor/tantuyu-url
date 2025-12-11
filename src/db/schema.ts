import { pgTable, text, integer, boolean, timestamp, doublePrecision, index } from "drizzle-orm/pg-core";

// --- Auth Tables (Better Auth Standard Schema) ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// --- App Specific Tables ---

export const urls = pgTable("url", {
  id: text("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  clicks: integer("clicks").default(0).notNull(),
  description: text("description"),
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  socialPreview: boolean("social_preview").default(false),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()) 
    .notNull(),
}, (table) => [
  index("idx_url_short_code").on(table.shortCode),
  index("idx_url_user_id").on(table.userId),
]);

export const urlEvents = pgTable("url_event", {
  id: text("id").primaryKey(),
  urlId: text("url_id").notNull().references(() => urls.id, { onDelete: "cascade" }),
  browser: text("browser"),
  device: text("device"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
}, (table) => [
  index("idx_event_url_id").on(table.urlId),
]);
