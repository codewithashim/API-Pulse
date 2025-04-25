import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"

const USERS_COLLECTION = "users"
const ENDPOINTS_COLLECTION = "endpoints"
const PINGS_COLLECTION = "pings"
const NOTIFICATION_SETTINGS_COLLECTION = "notificationSettings"
const NOTIFICATIONS_COLLECTION = "notifications"
const TEAMS_COLLECTION = "teams"
const TEAM_MEMBERS_COLLECTION = "teamMembers"

async function getCollection(collectionName: string) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "api-pulse")
  return db.collection(collectionName)
}

// User type
export type User = {
  _id?: string | ObjectId
  name?: string
  email: string
  password: string
  image?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

// Endpoint type
export type Endpoint = {
  status: string
  _id?: string | ObjectId
  name: string
  url: string
  method: string
  frequency: string
  cronExpression?: string
  headers?: any
  payload?: any
  timeout: number
  retryOnFailure: boolean
  notifications: boolean
  createdAt?: Date
  updatedAt?: Date
  userId: string
  teamId?: string
}

// Ping type
export type Ping = {
  _id?: string | ObjectId
  timestamp: Date
  status: string
  statusCode: number | null
  responseTime: number | null
  response: string | null
  endpointId: string
}

// Notification Settings type
export type NotificationSettings = {
  _id?: string | ObjectId
  emailNotifications: boolean
  slackNotifications: boolean
  slackWebhookUrl: string
  inAppNotifications: boolean
  notifyOnFailure: boolean
  notifyOnRecovery: boolean
  dailyDigest: boolean
  userId: string
}

// Notification type
export type Notification = {
  _id?: string | ObjectId
  type: string
  message: string
  sentAt: Date
  delivered: boolean
  read: boolean
  endpointId: string
  userId: string
}

// Team type
export type Team = {
  _id?: string | ObjectId
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

// TeamMember type
export type TeamMember = {
  _id?: string | ObjectId
  role: string
  createdAt?: Date
  updatedAt?: Date
  userId: string
  teamId: string
}

// --- User related functions ---
export async function createUser({
  name,
  email,
  password,
  image,
  role = "user",
}: {
  name?: string
  email: string
  password: string
  image?: string
  role?: string
}): Promise<User> {
  const collection = await getCollection(USERS_COLLECTION)
  const now = new Date()

  const newUser = {
    name,
    email,
    password,
    image,
    role,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newUser)
  return { ...newUser, _id: result.insertedId } as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const collection = await getCollection(USERS_COLLECTION)
  return (await collection.findOne({ email })) as User | null
}

export async function getUserById(id: string): Promise<User | null> {
  const collection = await getCollection(USERS_COLLECTION)
  return (await collection.findOne({ _id: new ObjectId(id) })) as User | null
}

// --- Endpoint related functions ---
export async function createEndpoint(
  endpointData: Omit<Endpoint, "_id" | "createdAt" | "updatedAt">,
): Promise<Endpoint> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  const now = new Date()

  const newEndpoint = {
    ...endpointData,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newEndpoint)
  return { ...newEndpoint, _id: result.insertedId } as Endpoint
}

export async function getEndpointsByUserId(userId: string): Promise<Endpoint[]> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  return (await collection.find({ userId }).toArray()) as Endpoint[]
}

export async function getEndpointById(id: string): Promise<Endpoint | null> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  return (await collection.findOne({ _id: new ObjectId(id) })) as Endpoint | null
}

export async function updateEndpoint(id: string, endpointData: Partial<Endpoint>): Promise<Endpoint | null> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  const now = new Date()

  const updatedEndpoint = {
    ...endpointData,
    updatedAt: now,
  }

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedEndpoint })
  return await getEndpointById(id)
}

export async function deleteEndpoint(id: string): Promise<void> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  await collection.deleteOne({ _id: new ObjectId(id) })
}

export async function getAllEndpoints(): Promise<Endpoint[]> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)
  return (await collection.find({}).toArray()) as Endpoint[]
}

// --- Ping related functions ---
export async function createPing(pingData: Omit<Ping, "_id">): Promise<Ping> {
  const collection = await getCollection(PINGS_COLLECTION)
  const newPing = {
    ...pingData,
  }
  const result = await collection.insertOne(newPing)
  return { ...newPing, _id: result.insertedId } as Ping
}

export async function getLatestPingsByUserId(userId: string, limit: number): Promise<Ping[]> {
  const collection = await getCollection(PINGS_COLLECTION)
  const endpointsCollection = await getCollection(ENDPOINTS_COLLECTION)

  // Find endpoint IDs for the given user ID
  const endpointIds = (await endpointsCollection.find({ userId }).toArray()).map((e) => e._id)

  return (await collection
    .find({ endpointId: { $in: endpointIds } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()) as Ping[]
}

export async function getLatestPingByEndpointId(endpointId: string): Promise<Ping | null> {
  const collection = await getCollection(PINGS_COLLECTION)
  return (await collection.findOne({ endpointId }, { sort: { timestamp: -1 } })) as Ping | null
}

export async function getPingsByEndpointId(endpointId: string, limit: number): Promise<Ping[]> {
  const collection = await getCollection(PINGS_COLLECTION)
  return (await collection.find({ endpointId: endpointId }).sort({ timestamp: -1 }).limit(limit).toArray()) as Ping[]
}

// --- Notification Settings related functions ---
export async function createNotificationSettings(
  settingsData: Omit<NotificationSettings, "_id">,
): Promise<NotificationSettings> {
  const collection = await getCollection(NOTIFICATION_SETTINGS_COLLECTION)
  const result = await collection.insertOne(settingsData)
  return { ...settingsData, _id: result.insertedId } as NotificationSettings
}

export async function getNotificationSettingsByUserId(userId: string): Promise<NotificationSettings | null> {
  const collection = await getCollection(NOTIFICATION_SETTINGS_COLLECTION)
  return (await collection.findOne({ userId })) as NotificationSettings | null
}

export async function updateNotificationSettings(
  userId: string,
  settingsData: Partial<NotificationSettings>,
): Promise<NotificationSettings | null> {
  const collection = await getCollection(NOTIFICATION_SETTINGS_COLLECTION)
  await collection.updateOne({ userId }, { $set: settingsData })
  return await getNotificationSettingsByUserId(userId)
}

// --- Notification related functions ---
export async function createNotification(notificationData: Omit<Notification, "_id">): Promise<Notification> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  const now = new Date()
  const newNotification = {
    ...notificationData,
    sentAt: now,
  }
  const result = await collection.insertOne(newNotification)
  return { ...newNotification, _id: result.insertedId } as Notification
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  return (await collection.find({ userId }).sort({ sentAt: -1 }).toArray()) as Notification[]
}

export async function updateNotificationDeliveryStatus(id: string, delivered: boolean): Promise<void> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { delivered } })
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  await collection.updateMany({ userId }, { $set: { read: true } })
}

// --- Endpoint Stats ---
export async function getEndpointStats(userId: string): Promise<{
  totalEndpoints: number
  healthyEndpoints: number
  failingEndpoints: number
  nextPingIn: string
  endpointsGrowth: number
}> {
  const endpoints = await getEndpointsByUserId(userId)
  const totalEndpoints = endpoints.length
  const healthyEndpoints = endpoints.filter((e) => e.status === "Healthy").length
  const failingEndpoints = endpoints.filter((e) => e.status === "Failing").length

  // Dummy values for now, implement real logic later
  const nextPingIn = "N/A"
  const endpointsGrowth = 0

  return {
    totalEndpoints,
    healthyEndpoints,
    failingEndpoints,
    nextPingIn,
    endpointsGrowth,
  }
}

// --- Endpoint with User ---
export async function getEndpointWithUser(endpointId: string): Promise<any | null> {
  const collection = await getCollection(ENDPOINTS_COLLECTION)

  const endpoint = await collection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(endpointId),
        },
      },
      {
        $lookup: {
          from: USERS_COLLECTION,
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ])
    .toArray()

  return endpoint[0] || null
}

// --- Notification Checks ---
export async function shouldSendNotification(endpointId: string): Promise<boolean> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Check if a failure notification has been sent in the last 24 hours
  const existingNotification = await collection.findOne({
    endpointId: endpointId,
    type: "failure",
    sentAt: { $gte: twentyFourHoursAgo },
  })

  return !existingNotification
}

export async function shouldSendRecoveryNotification(endpointId: string): Promise<boolean> {
  const collection = await getCollection(NOTIFICATIONS_COLLECTION)
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Check if a recovery notification has been sent in the last 24 hours
  const existingNotification = await collection.findOne({
    endpointId: endpointId,
    type: "recovery",
    sentAt: { $gte: twentyFourHoursAgo },
  })

  return !existingNotification
}

// --- Team related functions ---
export async function createTeam(teamData: Omit<Team, "_id" | "createdAt" | "updatedAt">): Promise<Team> {
  const collection = await getCollection(TEAMS_COLLECTION)
  const now = new Date()

  const newTeam = {
    ...teamData,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newTeam)
  return { ...newTeam, _id: result.insertedId } as Team
}

export async function createTeamMember(
  teamMemberData: Omit<TeamMember, "_id" | "createdAt" | "updatedAt">,
): Promise<TeamMember> {
  const collection = await getCollection(TEAM_MEMBERS_COLLECTION)
  const now = new Date()

  const newTeamMember = {
    ...teamMemberData,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newTeamMember)
  return { ...newTeamMember, _id: result.insertedId } as TeamMember
}
