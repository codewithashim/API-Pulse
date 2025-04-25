import {
  type Endpoint,
  type Ping,
  type User,
  createNotification,
  getNotificationSettingsByUserId,
  updateNotificationDeliveryStatus,
} from "./db-utils"

type EndpointWithUser = Endpoint & {
  user: User
}

export async function sendNotification(
  endpoint: EndpointWithUser,
  ping: Ping,
  type: "failure" | "recovery" = "failure",
) {
  try {
    // Skip if notifications are disabled for this endpoint
    if (!endpoint.notifications) {
      return
    }

    // Get user notification settings
    const settings = await getNotificationSettingsByUserId(endpoint.userId.toString())

    // Skip if all notifications are disabled
    if (!settings || (!settings.emailNotifications && !settings.slackNotifications && !settings.inAppNotifications)) {
      return
    }

    // Skip if this type of notification is disabled
    if (type === "failure" && !settings.notifyOnFailure) {
      return
    }

    if (type === "recovery" && !settings.notifyOnRecovery) {
      return
    }

    // Get user email
    const userEmail = endpoint.user.email

    // Create notification record for in-app notifications
    const notification = await createNotification({
      type,
      message:
        type === "failure"
          ? `Endpoint ${endpoint.name} is down. Status: ${ping.statusCode || "Timeout"}`
          : `Endpoint ${endpoint.name} has recovered. Status: ${ping.statusCode}`,
      sentAt: new Date(),
      delivered: false,
      read: false,
      endpointId: endpoint._id!.toString(),
      userId: endpoint.userId.toString(),
    })

    // Send email notification if enabled
    if (settings.emailNotifications) {
      const emailSent = await sendEmailNotification({
        to: userEmail,
        endpoint: endpoint,
        ping: ping,
        type,
      })

      console.log(`Email notification ${emailSent ? "sent" : "failed"} to ${userEmail} for endpoint ${endpoint.name}`)
    }

    // Send Slack notification if enabled
    if (settings.slackNotifications && settings.slackWebhookUrl) {
      const slackSent = await sendSlackNotification({
        webhookUrl: settings.slackWebhookUrl,
        endpoint: endpoint,
        ping: ping,
        type,
      })

      console.log(`Slack notification ${slackSent ? "sent" : "failed"} for endpoint ${endpoint.name}`)
    }

    // Mark notification as delivered
    if (notification._id) {
      await updateNotificationDeliveryStatus(notification._id.toString(), true)
    }

    console.log(`Notification processing completed for ${endpoint.name}`)
  } catch (error) {
    console.error("Failed to send notification:", error)
  }
}

interface EmailNotificationProps {
  to: string
  endpoint: Endpoint
  ping: Ping
  type: "failure" | "recovery"
}

async function sendEmailNotification({ to, endpoint, ping, type }: EmailNotificationProps) {
  // Check if SendGrid API key is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key not configured. Email notifications are disabled.")
    return false
  }

  const statusText = ping.statusCode ? `Status code: ${ping.statusCode}` : "Timeout or connection error"
  const responseTimeText = ping.responseTime ? `${ping.responseTime}ms` : "N/A"
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const subject =
    type === "failure"
      ? `🚨 API Pulse Alert: ${endpoint.name} is down`
      : `✅ API Pulse Recovery: ${endpoint.name} is back online`

  const backgroundColor = type === "failure" ? "#dc2626" : "#10b981"
  const icon = type === "failure" ? "🚨" : "✅"
  const title = type === "failure" ? "API Pulse Alert" : "API Pulse Recovery"
  const message =
    type === "failure"
      ? `We've detected that your endpoint <strong>${endpoint.name}</strong> is currently down.`
      : `Good news! Your endpoint <strong>${endpoint.name}</strong> is back online.`

  const emailData = {
    personalizations: [
      {
        to: [{ email: to }],
        subject,
      },
    ],
    from: {
      email: "notifications@apipulse.com",
      name: "API Pulse",
    },
    subject,
    content: [
      {
        type: "text/html",
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid ${backgroundColor};">
              <h1 style="color: ${backgroundColor}; margin: 0;">${icon} ${title}</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello,</p>
              <p>${message}</p>
              <div style="background-color: #f8f9fa; border-left: 4px solid ${backgroundColor}; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Endpoint:</strong> ${endpoint.name}</p>
                <p style="margin: 10px 0 0;"><strong>URL:</strong> ${endpoint.url}</p>
                <p style="margin: 10px 0 0;"><strong>Method:</strong> ${endpoint.method}</p>
                <p style="margin: 10px 0 0;"><strong>Status:</strong> ${statusText}</p>
                <p style="margin: 10px 0 0;"><strong>Response Time:</strong> ${responseTimeText}</p>
                <p style="margin: 10px 0 0;"><strong>Time:</strong> ${new Date(ping.timestamp).toLocaleString()}</p>
              </div>
              <p>${type === "failure" ? "Please check your endpoint as soon as possible." : "No further action is required at this time."}</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${appUrl}/dashboard/endpoints/${endpoint._id}" style="background-color: ${backgroundColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Endpoint Details</a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>This is an automated message from API Pulse. Please do not reply to this email.</p>
              <p>To manage your notification settings, visit your <a href="${appUrl}/dashboard/settings" style="color: #7c3aed;">account settings</a>.</p>
            </div>
          </div>
        `,
      },
    ],
  }

  try {
    console.log(`Sending email notification to ${to}...`)

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SendGrid API error: ${response.status} ${errorText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to send email notification:", error)
    return false
  }
}

interface SlackNotificationProps {
  webhookUrl: string
  endpoint: Endpoint
  ping: Ping
  type: "failure" | "recovery"
}

async function sendSlackNotification({ webhookUrl, endpoint, ping, type }: SlackNotificationProps) {
  const statusText = ping.statusCode ? `Status code: ${ping.statusCode}` : "Timeout or connection error"
  const responseTimeText = ping.responseTime ? `${ping.responseTime}ms` : "N/A"
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const title =
    type === "failure"
      ? `🚨 API Pulse Alert: ${endpoint.name} is down`
      : `✅ API Pulse Recovery: ${endpoint.name} is back online`

  const message =
    type === "failure"
      ? `We've detected that your endpoint *${endpoint.name}* is currently down.`
      : `Good news! Your endpoint *${endpoint.name}* is back online.`

  const color = type === "failure" ? "#dc2626" : "#10b981"

  const slackData = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Endpoint:*\n${endpoint.name}`,
          },
          {
            type: "mrkdwn",
            text: `*URL:*\n${endpoint.url}`,
          },
          {
            type: "mrkdwn",
            text: `*Method:*\n${endpoint.method}`,
          },
          {
            type: "mrkdwn",
            text: `*Status:*\n${statusText}`,
          },
          {
            type: "mrkdwn",
            text: `*Response Time:*\n${responseTimeText}`,
          },
          {
            type: "mrkdwn",
            text: `*Time:*\n${new Date(ping.timestamp).toLocaleString()}`,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Endpoint Details",
              emoji: true,
            },
            url: `${appUrl}/dashboard/endpoints/${endpoint._id}`,
            style: "primary",
          },
        ],
      },
    ],
    attachments: [
      {
        color: color,
      },
    ],
  }

  try {
    console.log(`Sending Slack notification to webhook...`)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Slack API error: ${response.status} ${errorText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to send Slack notification:", error)
    return false
  }
}
