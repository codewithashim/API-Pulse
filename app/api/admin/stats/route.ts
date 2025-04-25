import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()

    // Get user stats
    const totalUsers = await db.collection("users").countDocuments()
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const newUsersToday = await db.collection("users").countDocuments({
      createdAt: { $gte: oneDayAgo }
    })

    // Get endpoint stats
    const totalEndpoints = await db.collection("endpoints").countDocuments()
    const activeEndpoints = await db.collection("endpoints").countDocuments({
      // Consider an endpoint active if it has been pinged in the last 24 hours
      _id: {
        $in: await db.collection("pings").distinct("endpointId", {
          timestamp: { $gte: oneDayAgo }
        })
      }
    })

    // Get ping stats
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    const pingsLastHour = await db.collection("pings").countDocuments({
      timestamp: { $gte: oneHourAgo }
    })

    // Get system stats (simulated for this example)
    const systemStats = {
      status: "Healthy",
      uptime: "5d 12h 30m",
      dbConnections: 12,
      memoryUsage: 42,
      rateLimit: 100
    }

    // Get recent logs (simulated for this example)
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "System health check completed successfully"
      },
      {
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        level: "warning",
        message: "High CPU usage detected (78%)"
      },
      {
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        level: "error",
        message: "Failed to connect to backup service"
      },
      {
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        level: "info",
        message: "Database backup completed successfully"
      }
    ]

    return NextResponse.json({
      users: {
        \
### Enhanced API Pulse Application

I'll implement the requested improvements to make the API Pulse application more professional, user-friendly, and secure with role-based access control. Let's start by fixing the Google sign-in and adding role-based access control.

First, let's update the user model to include roles and enhance the authentication system:
