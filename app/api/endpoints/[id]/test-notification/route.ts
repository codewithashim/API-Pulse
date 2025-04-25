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
    // Check if the endpoint exists and belongs to the user
    const endpointWithUser = await getEndpointWithUser(params.id)

    if (!endpointWithUser) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    if (endpointWithUser.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create a mock ping for testing notification
    const mockPing = await createPing({
      timestamp: new Date(),
      status: "failure",
      statusCode: 500,
      responseTime: 0,
      response: "This is a test notification",
      endpointId: endpointWithUser._id!.toString(),
    })

    // Send test notification
    await sendNotification(endpointWithUser, mockPing)

    return NextResponse.json({ success: true, message: "Test notification sent" })
  } catch (error) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
