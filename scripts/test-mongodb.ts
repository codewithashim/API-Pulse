/**
 * This script tests the MongoDB connection and displays database information.
 *
 * Usage:
 * 1. Set the MONGODB_URI environment variable
 * 2. Run with: npx tsx scripts/test-mongodb.ts
 */

import { MongoClient } from "mongodb"

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const dbName = process.env.MONGODB_DB || "api-pulse"
    const db = client.db(dbName)
    console.log(`Using database: ${dbName}`)

    // List collections
    console.log("\nCollections in database:")
    const collections = await db.listCollections().toArray()
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`)
    })

    // Count documents in each collection
    console.log("\nDocument counts:")
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      console.log(`- ${collection.name}: ${count} documents`)
    }

    // Sample data from each collection
    console.log("\nSample data:")
    for (const collection of collections) {
      const sample = await db.collection(collection.name).find().limit(1).toArray()
      if (sample.length > 0) {
        console.log(`\n${collection.name} sample:`)
        // If it's a user, hide the password
        if (collection.name === "users" && sample[0].password) {
          sample[0].password = "[HIDDEN]"
        }
        console.log(JSON.stringify(sample[0], null, 2))
      }
    }
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error)
  } finally {
    await client.close()
    console.log("\nMongoDB connection closed")
  }
}

main().catch(console.error)
