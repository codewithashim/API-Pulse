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

    // Parse headers if they're provided as a string
    let headers = data.headers
    if (typeof headers === "string") {
      try {
        // Try to parse as JSON first
        headers = JSON.parse(headers)
      } catch (e) {
        // If not valid JSON, try to parse as key-value pairs
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
      }
    }

    // Parse payload if it's provided as a string and method is not GET
    let payload = data.payload
    if (typeof payload === "string" && data.method !== "GET") {
      try {
        payload = JSON.parse(payload)
      } catch (e) {
        // If not valid JSON, keep as string
      }
    }

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
      notifications: data.notifications ?? true,
      userId: session.user.id,
    })

    return NextResponse.json(endpoint)
  } catch (error) {
    console.error("Failed to create endpoint:", error)
    return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 })
  }
}
