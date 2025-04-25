import { NextResponse } from "next/server"
import { headers } from "next/headers"

import {
  getAllEndpoints,
  getEndpointWithUser,
  createPing,
  shouldSendNotification,
  shouldSendRecoveryNotification,
} from "@/lib/db-utils"
import { sendNotification } from "@/lib/notification-service"

export async function GET(request: Request) {
  console.log("Cron job started")

  // Verify this is a legitimate cron job from Vercel
  const authHeader = headers().get("Authorization")
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set")
    return new Response("Server configuration error", { status: 500 })
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("Unauthorized cron job attempt")
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    // Get all endpoints that need to be pinged
    console.log("Fetching endpoints to ping...")
    const endpoints = await getAllEndpoints()
    console.log(`Found ${endpoints.length} endpoints to process`)

    // Process each endpoint
    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        console.log(`Processing endpoint: ${endpoint.name} (${endpoint.url})`)
        return pingEndpoint(endpoint)
      }),
    )

    // Count successes and failures
    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    console.log(
      `Cron job completed. Processed ${endpoints.length} endpoints (${successful} successful, ${failed} failed)`,
    )

    return NextResponse.json({
      success: true,
      processed: endpoints.length,
      successful,
      failed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job failed:", error)
    return NextResponse.json(
      {
        error: "Failed to process endpoints",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function pingEndpoint(endpoint: any) {
  console.log(`Pinging endpoint: ${endpoint.name} (${endpoint.url})`)

  const startTime = Date.now()
  let status = "success"
  let statusCode = null
  let responseTime = null
  let responseBody = null

  try {
    // Prepare headers
    const headers = endpoint.headers || {}

    // Prepare request options
    const options: RequestInit = {
      method: endpoint.method,
      headers,
      body: endpoint.method !== "GET" ? JSON.stringify(endpoint.payload) : undefined,
      signal: AbortSignal.timeout(endpoint.timeout * 1000),
    }

    console.log(`Making ${endpoint.method} request to ${endpoint.url}...`)

    // Make the request
    const response = await fetch(endpoint.url, options)
    statusCode = response.status

    // Get response body
    responseBody = await response.text()

    // Calculate response time
    responseTime = Date.now() - startTime

    // Check if the status code indicates a failure
    if (statusCode < 200 || statusCode >= 400) {
      status = "failure"
      console.log(`Endpoint ${endpoint.name} failed with status code ${statusCode}`)
    } else {
      console.log(`Endpoint ${endpoint.name} succeeded with status code ${statusCode}`)
    }
  } catch (error) {
    status = "failure"
    responseBody = error instanceof Error ? error.message : "Unknown error"
    console.log(`Endpoint ${endpoint.name} failed with error: ${responseBody}`)
  }

  // Record the ping in the database
  console.log(`Recording ping result for ${endpoint.name}...`)
  const ping = await createPing({
    timestamp: new Date(),
    status,
    statusCode,
    responseTime,
    response: responseBody,
    endpointId: endpoint._id!.toString(),
  })

  // Get the endpoint with user data
  const endpointWithUser = await getEndpointWithUser(endpoint._id!.toString())
  if (!endpointWithUser) {
    console.log(`Could not find user data for endpoint ${endpoint.name}`)
    return ping
  }

  // If the ping failed and notifications are enabled, check if we should send a notification
  if (status === "failure" && endpoint.notifications) {
    console.log(`Checking if failure notification should be sent for ${endpoint.name}...`)
    const shouldNotify = await shouldSendNotification(endpoint._id!.toString())

    if (shouldNotify) {
      console.log(`Sending failure notification for ${endpoint.name}...`)
      await sendNotification(endpointWithUser, ping, "failure")
    } else {
      console.log(`Failure notification not needed for ${endpoint.name} (already notified)`)
    }
  }

  // If the ping succeeded and notifications are enabled, check if we should send a recovery notification
  if (status === "success" && endpoint.notifications) {
    console.log(`Checking if recovery notification should be sent for ${endpoint.name}...`)
    const shouldNotify = await shouldSendRecoveryNotification(endpoint._id!.toString())

    if (shouldNotify) {
      console.log(`Sending recovery notification for ${endpoint.name}...`)
      await sendNotification(endpointWithUser, ping, "recovery")
    }
  }

  console.log(`Finished processing endpoint: ${endpoint.name}`)
  return ping
}
