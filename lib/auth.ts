import { compare, hash } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "./mongodb"
import { createNotificationSettings, createUser, getUserByEmail, getUserById } from "./db-utils"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // Default role for Google sign-in
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = await getUserByEmail(credentials.email)

        if (!user) {
          return null
        }

        // Compare passwords
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "user", // Include role in the token
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string | undefined
        session.user.role = (token.role as string) || "user" // Add role to session
      }
      return session
    },
    async jwt({ token, user, account, profile, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
      }

      // If it's a new Google sign-in
      if (account?.provider === "google" && account?.type === "oauth") {
        try {
          const existingUser = await getUserByEmail(token.email as string)

          if (!existingUser) {
            // Create a new user for Google sign-in if they don't exist
            const newUser = await createUser({
              name: token.name as string,
              email: token.email as string,
              password: await hash(Math.random().toString(36).substring(2, 15), 12), // Random password
              role: "user", // Default role
              image: token.picture as string,
            })

            // Create notification settings for new Google users
            await createNotificationSettings({
              emailNotifications: true,
              slackNotifications: false,
              telegramNotifications: false,
              inAppNotifications: true,
              notifyOnFailure: true,
              notifyOnRecovery: true,
              dailyDigest: false,
              userId: newUser._id!.toString(),
            })

            // Update token with user ID
            token.id = newUser._id!.toString()
          } else {
            // Update token with existing user ID and role
            token.id = existingUser._id!.toString()
            token.role = existingUser.role || "user"
          }
        } catch (error) {
          console.error("Error setting up new Google user:", error)
        }
      }

      // Handle session updates
      if (trigger === "update" && token?.id) {
        // Refresh user data when session is updated
        const user = await getUserById(token.id as string)
        if (user) {
          token.name = user.name
          token.role = user.role || "user"
          token.picture = user.image
        }
      }

      return token
    },
  },
  debug: process.env.NODE_ENV === "development",
}

// Helper function to hash passwords
export async function hashPassword(password: string) {
  return await hash(password, 12)
}

// Helper function to create a new user
export async function registerUser({
  name,
  email,
  password,
  role = "user",
}: { name: string; email: string; password: string; role?: string }) {
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    role, // Include role when creating user
  })

  // Create default notification settings
  await createNotificationSettings({
    emailNotifications: true,
    slackNotifications: false,
    telegramNotifications: false,
    inAppNotifications: true,
    notifyOnFailure: true,
    notifyOnRecovery: true,
    dailyDigest: false,
    userId: user._id!.toString(),
  })

  return user
}
