"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users, Activity, Server, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Check if user is admin
    if (session?.user?.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch admin stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        toast({
          title: "Error",
          description: "Failed to load admin statistics.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchStats()
    }
  }, [session, router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin Access</AlertTitle>
        <AlertDescription>You have administrative privileges. Please use these powers responsibly.</AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.users?.newToday || 0} new today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.endpoints?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.endpoints?.active || 0} currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.system?.status || "Healthy"}</div>
            <p className="text-xs text-muted-foreground">{stats?.system?.uptime || "Unknown"} uptime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ping Frequency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pings?.lastHour || 0}</div>
            <p className="text-xs text-muted-foreground">pings in the last hour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section will allow you to manage users, assign roles, and handle account issues.</p>
              <div className="mt-4">
                <a href="/dashboard/admin/users" className="text-primary hover:underline">
                  Go to User Management →
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Database Status</h3>
                  <div className="mt-2 flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Connected - {stats?.system?.dbConnections || 0} active connections</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Memory Usage</h3>
                  <div className="mt-2 h-2 w-full bg-muted overflow-hidden rounded-full">
                    <div className="h-full bg-primary" style={{ width: `${stats?.system?.memoryUsage || 0}%` }}></div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {stats?.system?.memoryUsage || 0}% of allocated memory
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">API Rate Limits</h3>
                  <div className="mt-2 text-sm">
                    Current limit: {stats?.system?.rateLimit || 100} requests per minute
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent system activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.logs?.map((log: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        log.level === "error"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : log.level === "warning"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {log.level}
                    </div>
                    <div>{log.message}</div>
                  </div>
                ))}
                {(!stats?.logs || stats.logs.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">No recent activity logs</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
