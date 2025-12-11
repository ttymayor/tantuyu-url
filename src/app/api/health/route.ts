import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const startTime = performance.now();
    // Perform a simple query to check database connectivity
    // Using a simple calculation query that doesn't depend on specific tables
    await db.execute(sql`SELECT 1`);
    const dbLatency = performance.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: {
          status: "connected",
          latency: `${Math.round(dbLatency)}ms`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: {
          status: "disconnected",
        },
      },
      { status: 503 }
    );
  }
}
