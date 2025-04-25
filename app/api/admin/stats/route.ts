import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { MongoServerError } from "mongodb";

export async function GET(request: Request) {
  try {
    // Verify user session and role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const db = await getDb();

    // Get user statistics
    const totalUsers = await db.collection("users").countDocuments();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsersToday = await db.collection("users").countDocuments({
      createdAt: { $gte: oneDayAgo },
    });

    // Get endpoint statistics
    const totalEndpoints = await db.collection("endpoints").countDocuments();
    const activeEndpoints = await db.collection("endpoints").countDocuments({
      _id: {
        $in: await db.collection("pings").distinct("endpointId", {
          timestamp: { $gte: oneDayAgo },
        }),
      },
    });

    // Get ping statistics
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const pingsLastHour = await db.collection("pings").countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    // Get system statistics
    const systemStats = await getSystemStats(db);

    // Get recent logs (limited to last 10 entries)
    const logs = await db
      .collection("logs")
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Format response
    const response = {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        activeLast24h: await db.collection("users").countDocuments({
          lastActive: { $gte: oneDayAgo },
        }),
      },
      endpoints: {
        total: totalEndpoints,
        active: activeEndpoints,
        pingsLastHour: pingsLastHour,
      },
      system: systemStats,
      logs: logs.map((log) => ({
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        message: log.message,
        source: log.source || "system",
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in stats endpoint:", error);
    
    if (error instanceof MongoServerError) {
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getSystemStats(db: any) {
  try {
    // Get actual system metrics (implement according to your infrastructure)
    const dbStats = await db.command({ dbStats: 1 });
    
    return {
      status: "Healthy",
      uptime: process.uptime ? `${Math.floor(process.uptime() / 86400)}d ${Math.floor((process.uptime() % 86400) / 3600)}h` : "N/A",
      dbConnections: dbStats.connections?.current || 0,
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      rateLimit: {
        remaining: 1000, // Implement actual rate limiting logic
        reset: new Date(Date.now() + 3600000).toISOString(),
      },
      database: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024) + "MB",
      },
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    return {
      status: "Degraded",
      uptime: "N/A",
      dbConnections: 0,
      memoryUsage: 0,
      rateLimit: { remaining: 0, reset: new Date().toISOString() },
      database: { collections: 0, objects: 0, dataSize: "0MB" },
    };
  }
}