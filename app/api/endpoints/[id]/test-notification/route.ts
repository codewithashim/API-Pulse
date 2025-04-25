import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getEndpointWithUser, createPing } from "@/lib/db-utils"
import { sendNotification } from "@/lib/notification-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the endpoint with user data for notifications
    const endpointWithUser = await getEndpointWithUser(params.id)
    
    if (!endpointWithUser) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    // Check if the endpoint belongs to the current user
    if (endpointWithUser.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create a test ping
    const testPing = await createPing({
      timestamp: new Date(),
      status: "test",
      statusCode: 200,
      responseTime: 123,
      response: "This is a test notification",
      endpointId: params.id,
    })

    // Send a test notification
    await sendNotification(endpointWithUser, testPing, "failure")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}