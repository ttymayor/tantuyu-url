import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/db/schema";

const dbPath = process.env.DB_FILE_NAME || "sqlite.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
