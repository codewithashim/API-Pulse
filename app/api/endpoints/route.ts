import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { createEndpoint, getEndpointsByUserId } from "@/lib/db-utils"

// Get all endpoints for the current user
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const endpoints = await getEndpointsByUserId(session.user.id)
    return NextResponse.json(endpoints)
  } catch (error) {
    console.error("Failed to fetch endpoints:", error)
    return NextResponse.json({ error: "Failed to fetch endpoints" }, { status: 500 })
  }
}

// Create a new endpoint
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(data.url)
    } catch (error) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Parse headers if they're provided as a string
    let headers = data.headers
    if (typeof headers === "string" && headers.trim() !== "") {
      try {
        // Try to parse as JSON first
        headers = JSON.parse(headers)
      } catch (e) {
        // If not valid JSON, try to parse as key-value pairs
        try {
          headers = data.headers
            .split("\n")
            .filter(Boolean)
            .reduce((acc: Record<string, string>, line: string) => {
              const [key, ...valueParts] = line.split(":")
              const value = valueParts.join(":").trim()
              if (key && value) {
                acc[key.trim()] = value
              }
              return acc
            }, {})
        } catch (parseError) {
          console.error("Headers parsing error:", parseError)
          return NextResponse.json({ error: "Invalid headers format" }, { status: 400 })
        }
      }
    }

    // Parse payload if it's provided as a string and method is not GET
    let payload = data.payload
    if (typeof payload === "string" && payload.trim() !== "" && data.method !== "GET") {
      try {
        payload = JSON.parse(payload)
      } catch (e) {
        // If not valid JSON, keep as string
        // This is intentional as some APIs accept non-JSON payloads
      }
    }
    
    // Handle notification settings
    const notifyOnFailure = data.notifyOnFailure ?? true
    const notifyOnRecovery = data.notifyOnRecovery ?? true
    
    // Create the endpoint with initial status
    const endpoint = await createEndpoint({
      name: data.name,
      url: data.url,
      method: data.method || "GET",
      frequency: data.frequency || "hourly",
      cronExpression: data.cronExpression,
      headers: headers || undefined,
      payload: payload || undefined,
      timeout: data.timeout || 30,
      retryOnFailure: data.retryOnFailure ?? true,
      notifications: (notifyOnFailure || notifyOnRecovery) ? true : false,
      status: "pending", // Set initial status as pending until first ping
      userId: session.user.id,
      teamId: data.teamId || undefined, // Handle team assignment if provided
    })

    // Store notification preferences in endpoint metadata or a separate collection if needed
    // This is a placeholder for more advanced notification settings
    // In a real implementation, you might want to store these in a separate collection

    return NextResponse.json(endpoint)
  } catch (error) {
    console.error("Failed to create endpoint:", error)
    return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 })
  }
}
