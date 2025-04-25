"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ChevronLeft, Mail, MessageSquare, Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function NotificationSettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    slackWebhookUrl: "",
    inAppNotifications: true,
    notifyOnFailure: true,
    notifyOnRecovery: true,
    dailyDigest: false,
  })

  // Fetch user's notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/user/notification-settings")

        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Failed to fetch notification settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchSettings()
    }
  }, [session])

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated.",
      })
    } catch (error) {
      console.error("Failed to save notification settings:", error)
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your notification settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications in the application</p>
              </div>
            </div>
            <Switch
              checked={settings.inAppNotifications}
              onCheckedChange={() => handleToggle("inAppNotifications")}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Slack Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications in Slack</p>
              </div>
            </div>
            <Switch
              checked={settings.slackNotifications}
              onCheckedChange={() => handleToggle("slackNotifications")}
              disabled={isLoading}
            />
          </div>

          {settings.slackNotifications && (
            <div className="ml-12 rounded-md border p-4">
              <Label htmlFor="slackWebhookUrl" className="text-sm font-medium">
                Slack Webhook URL
              </Label>
              <div className="mt-1">
                <Input
                  id="slackWebhookUrl"
                  name="slackWebhookUrl"
                  value={settings.slackWebhookUrl}
                  onChange={handleInputChange}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                You can create a webhook URL in your Slack workspace settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure when you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Endpoint Failures</p>
              <p className="text-sm text-muted-foreground">Notify when an endpoint fails</p>
            </div>
            <Switch
              checked={settings.notifyOnFailure}
              onCheckedChange={() => handleToggle("notifyOnFailure")}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Endpoint Recovery</p>
              <p className="text-sm text-muted-foreground">Notify when an endpoint recovers after failure</p>
            </div>
            <Switch
              checked={settings.notifyOnRecovery}
              onCheckedChange={() => handleToggle("notifyOnRecovery")}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Digest</p>
              <p className="text-sm text-muted-foreground">Receive a daily summary of all endpoint statuses</p>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={() => handleToggle("dailyDigest")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
