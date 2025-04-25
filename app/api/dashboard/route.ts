import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  getEndpointsByUserId,
  getEndpointStats,
  getLatestPingsByUserId,
  getLatestPingByEndpointId, // Import the missing function
} from "@/lib/db-utils"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user ID from session
    const userId = session.user.id

    // Fetch all endpoints for the user
    const endpoints = await getEndpointsByUserId(userId)

    // Get the latest ping for each endpoint to determine status
    const endpointsWithStatus = await Promise.all(
      endpoints.map(async (endpoint) => {
        const latestPing = await getLatestPingByEndpointId(endpoint._id.toString())

        // Calculate next ping time based on frequency
        const nextPing = calculateNextPingTime(endpoint, latestPing)

        return {
          _id: endpoint._id,
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          frequency: endpoint.frequency,
          status: latestPing?.status === "success" ? "Healthy" : "Failing",
          lastPing: latestPing ? formatTimeAgo(latestPing.timestamp) : "Never",
          nextPing: nextPing,
          responseTime: latestPing?.responseTime ? `${latestPing.responseTime}ms` : "N/A",
        }
      }),
    )

    // Get recent pings across all endpoints
    const recentPings = await getLatestPingsByUserId(userId, 10)

    // Format recent pings for display
    const formattedRecentPings = recentPings.map((ping) => ({
      _id: ping._id,
      endpoint: {
        _id: ping.endpointId,
        name: endpoints.find((e) => e._id.toString() === ping.endpointId.toString())?.name || "Unknown",
        url: endpoints.find((e) => e._id.toString() === ping.endpointId.toString())?.url || "",
      },
      timestamp: ping.timestamp.toISOString(),
      status: ping.status,
      statusCode: ping.statusCode,
      responseTime: ping.responseTime ? `${ping.responseTime}ms` : "Timeout",
    }))

    // Get dashboard stats
    const stats = await getEndpointStats(userId)

    // Calculate metrics
    const metrics = calculateMetrics(endpoints, recentPings)

    return NextResponse.json({
      endpoints: endpointsWithStatus,
      recentPings: formattedRecentPings,
      stats,
      metrics,
    })
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

// Helper function to calculate next ping time based on frequency
function calculateNextPingTime(endpoint, latestPing) {
  if (!latestPing) return "N/A"

  const lastPingTime = new Date(latestPing.timestamp).getTime()
  let nextPingTime

  switch (endpoint.frequency) {
    case "5min":
      nextPingTime = lastPingTime + 5 * 60 * 1000
      break
    case "15min":
      nextPingTime = lastPingTime + 15 * 60 * 1000
      break
    case "30min":
      nextPingTime = lastPingTime + 30 * 60 * 1000
      break
    case "hourly":
      nextPingTime = lastPingTime + 60 * 60 * 1000
      break
    case "daily":
      nextPingTime = lastPingTime + 24 * 60 * 60 * 1000
      break
    case "weekly":
      nextPingTime = lastPingTime + 7 * 24 * 60 * 60 * 1000
      break
    default:
      return "Custom"
  }

  const now = Date.now()
  if (nextPingTime < now) return "Overdue"

  const diffMs = nextPingTime - now

  // Format as minutes and seconds
  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.floor(diffMs / (60 * 1000))
    const seconds = Math.floor((diffMs % (60 * 1000)) / 1000)
    return `${minutes}m ${seconds}s`
  }

  // Format as hours and minutes
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000))
  return `${hours}h ${minutes}m`
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds} seconds ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

// Helper function to calculate metrics
function calculateMetrics(endpoints, pings) {
  // Calculate uptime percentage
  const totalPings = pings.length
  const successfulPings = pings.filter((ping) => ping.status === "success").length
  const uptime = totalPings > 0 ? `${Math.round((successfulPings / totalPings) * 100)}%` : "N/A"

  // Calculate average response time
  const responseTimes = pings
    .filter((ping) => ping.status === "success" && ping.responseTime)
    .map((ping) => ping.responseTime)

  const avgResponseTime =
    responseTimes.length > 0
      ? `${Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)}ms`
      : "N/A"

  // Count failures in the last 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const failuresLast24h = pings.filter(
    (ping) => ping.status === "failure" && new Date(ping.timestamp) > oneDayAgo,
  ).length

  return {
    uptime,
    avgResponseTime,
    failures: failuresLast24h,
  }
}
