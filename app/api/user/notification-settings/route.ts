import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getNotificationSettingsByUserId, updateNotificationSettings, createNotificationSettings } from "@/lib/db-utils"

// Get notification settings for the current user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await getNotificationSettingsByUserId(session.user.id)

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = {
        emailNotifications: true,
        slackNotifications: false,
        slackWebhookUrl: "",
        inAppNotifications: true,
        notifyOnFailure: true,
        notifyOnRecovery: true,
        dailyDigest: false,
        userId: session.user.id,
      }

      const newSettings = await createNotificationSettings(defaultSettings)
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 })
  }
}

// Update notification settings for the current user
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (data.emailNotifications === undefined || data.notifyOnFailure === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get existing settings
    let settings = await getNotificationSettingsByUserId(session.user.id)

    if (!settings) {
      // Create new settings if none exist
      settings = await createNotificationSettings({
        ...data,
        userId: session.user.id,
      })
    } else {
      // Update existing settings
      settings = await updateNotificationSettings(session.user.id, data)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to update notification settings:", error)
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 })
  }
}
