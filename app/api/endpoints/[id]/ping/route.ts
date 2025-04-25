import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getEndpointById, getEndpointWithUser, createPing, shouldSendNotification, shouldSendRecoveryNotification } from "@/lib/db-utils"
import { sendNotification } from "@/lib/notification-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the endpoint exists and belongs to the user
    const endpoint = await getEndpointById(params.id)

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    if (endpoint.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Prepare headers
    const headers: Record<string, string> = endpoint.headers || {}

    // Prepare request options
    const options: RequestInit = {
      method: endpoint.method,
      headers,
      body: endpoint.method !== "GET" ? JSON.stringify(endpoint.payload) : undefined,
      signal: AbortSignal.timeout(endpoint.timeout * 1000),
    }

    const startTime = Date.now()
    let status = "success"
    let statusCode = null
    let responseTime = null
    let responseBody = null

    try {
      // Make the request
      const response = await fetch(endpoint.url, options)
      statusCode = response.status
      responseBody = await response.text()
      responseTime = Date.now() - startTime

      // Check if the status code indicates a failure
      if (statusCode < 200 || statusCode >= 400) {
        status = "failure"
      }
    } catch (error) {
      status = "failure"
      responseBody = error instanceof Error ? error.message : "Unknown error"
    }

    // Record the ping in the database
    const ping = await createPing({
      timestamp: new Date(),
      status,
      statusCode,
      responseTime,
      response: responseBody,
      endpointId: endpoint._id!.toString(),
    })

    // Get the endpoint with user data for notifications
    const endpointWithUser = await getEndpointWithUser(endpoint._id!.toString())
    
    // Send notifications if needed
    if (endpointWithUser && endpointWithUser.notifications) {
      if (status === "failure" && await shouldSendNotification(endpoint._id!.toString())) {
        await sendNotification(endpointWithUser, ping, "failure")
      } else if (status === "success" && await shouldSendRecoveryNotification(endpoint._id!.toString())) {
        await sendNotification(endpointWithUser, ping, "recovery")
      }
    }

    return NextResponse.json(ping)
  } catch (error) {
    console.error("Failed to ping endpoint:", error)
    return NextResponse.json({ error: "Failed to ping endpoint" }, { status: 500 })
  }
}
