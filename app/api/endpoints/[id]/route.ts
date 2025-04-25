import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { deleteEndpoint, getEndpointById, getPingsByEndpointId, updateEndpoint } from "@/lib/db-utils"

// Get a specific endpoint
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const endpoint = await getEndpointById(params.id)

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    // Check if the endpoint belongs to the current user
    if (endpoint.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get recent pings
    const pings = await getPingsByEndpointId(params.id, 10)

    return NextResponse.json({ ...endpoint, pings })
  } catch (error) {
    console.error("Failed to fetch endpoint:", error)
    return NextResponse.json({ error: "Failed to fetch endpoint" }, { status: 500 })
  }
}

// Update an endpoint
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the endpoint exists and belongs to the user
    const existingEndpoint = await getEndpointById(params.id)

    if (!existingEndpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    if (existingEndpoint.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

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

    const updatedEndpoint = await updateEndpoint(params.id, {
      name: data.name,
      url: data.url,
      method: data.method,
      frequency: data.frequency,
      cronExpression: data.cronExpression,
      headers: headers || undefined,
      payload: payload || undefined,
      timeout: data.timeout,
      retryOnFailure: data.retryOnFailure,
      notifications: data.notifications,
    })

    return NextResponse.json(updatedEndpoint)
  } catch (error) {
    console.error("Failed to update endpoint:", error)
    return NextResponse.json({ error: "Failed to update endpoint" }, { status: 500 })
  }
}

// Delete an endpoint
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the endpoint exists and belongs to the user
    const existingEndpoint = await getEndpointById(params.id)

    if (!existingEndpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    if (existingEndpoint.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the endpoint
    await deleteEndpoint(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete endpoint:", error)
    return NextResponse.json({ error: "Failed to delete endpoint" }, { status: 500 })
  }
}
