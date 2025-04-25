/**
 * This script seeds the MongoDB database with initial data for testing.
 *
 * Usage:
 * 1. Set the MONGODB_URI environment variable
 * 2. Run with: npx tsx scripts/seed-mongodb.ts
 */

import { MongoClient } from "mongodb"
import { hash } from "bcryptjs"

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(process.env.MONGODB_DB || "api-pulse")

    // Clear existing data
    console.log("Clearing existing data...")
    await db.collection("pings").deleteMany({})
    await db.collection("endpoints").deleteMany({})
    await db.collection("notificationSettings").deleteMany({})
    await db.collection("notifications").deleteMany({})
    await db.collection("users").deleteMany({})

    // Create test user
    console.log("Creating test user...")
    const hashedPassword = await hash("password123", 12)
    const user = await db.collection("users").insertOne({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const userId = user.insertedId

    // Create notification settings
    console.log("Creating notification settings...")
    await db.collection("notificationSettings").insertOne({
      emailNotifications: true,
      slackNotifications: false,
      telegramNotifications: false,
      notifyOnFailure: true,
      notifyOnRecovery: true,
      dailyDigest: false,
      userId,
    })

    // Create sample endpoints
    console.log("Creating sample endpoints...")
    const endpoint1 = await db.collection("endpoints").insertOne({
      name: "Production API",
      url: "https://api.example.com/status",
      method: "GET",
      frequency: "hourly",
      timeout: 30,
      retryOnFailure: true,
      notifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    })

    const endpoint2 = await db.collection("endpoints").insertOne({
      name: "Authentication Service",
      url: "https://auth.example.com/health",
      method: "GET",
      frequency: "hourly",
      timeout: 30,
      retryOnFailure: true,
      notifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    })

    // Create sample pings
    console.log("Creating sample pings...")

    // Pings for endpoint 1
    const now = new Date()
    for (let i = 1; i <= 5; i++) {
      const isFailing = i % 4 === 0
      await db.collection("pings").insertOne({
        timestamp: new Date(now.getTime() - i * 60 * 60 * 1000), // hours ago
        status: isFailing ? "failure" : "success",
        statusCode: isFailing ? 500 : 200,
        responseTime: isFailing ? null : 200 + Math.floor(Math.random() * 100),
        response: isFailing
          ? JSON.stringify({ error: "Internal Server Error" })
          : JSON.stringify({ status: "ok", version: "1.0.5" }),
        endpointId: endpoint1.insertedId,
      })
    }

    // Pings for endpoint 2
    for (let i = 1; i <= 5; i++) {
      await db.collection("pings").insertOne({
        timestamp: new Date(now.getTime() - i * 60 * 60 * 1000), // hours ago
        status: "success",
        statusCode: 200,
        responseTime: 150 + Math.floor(Math.random() * 50),
        response: JSON.stringify({ status: "healthy", uptime: "5d 12h 30m" }),
        endpointId: endpoint2.insertedId,
      })
    }

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

main().catch(console.error)
