/**
 * This script manually triggers the cron job for testing purposes.
 *
 * Usage:
 * 1. Set the CRON_SECRET environment variable
 * 2. Run with: npx tsx scripts/trigger-cron.ts
 */

async function main() {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set")
    process.exit(1)
  }

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const cronUrl = `${appUrl}/api/cron/run`

  console.log(`Triggering cron job at: ${cronUrl}`)

  try {
    const response = await fetch(cronUrl, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    })

    const data = await response.json()

    if (response.ok) {
      console.log("Cron job triggered successfully!")
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.error(`Failed to trigger cron job: ${response.status} ${response.statusText}`)
      console.error(JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error("Error triggering cron job:", error)
  }
}

main().catch(console.error)
