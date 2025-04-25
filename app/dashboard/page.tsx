"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, ArrowUpRight, Clock, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { EndpointStatusList } from "@/components/endpoint-status-list"
import { RecentPingsTable } from "@/components/recent-pings-table"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/endpoints/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Endpoint
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStats isLoading={isLoading} data={dashboardData?.stats} />

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Endpoint Status</TabsTrigger>
          <TabsTrigger value="recent">Recent Pings</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-4">
          <EndpointStatusList isLoading={isLoading} endpoints={dashboardData?.endpoints} />
        </TabsContent>
        <TabsContent value="recent" className="mt-4">
          <RecentPingsTable isLoading={isLoading} pings={dashboardData?.recentPings} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-2 h-4 w-40" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-2 h-4 w-40" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failures</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-2 h-4 w-40" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.metrics?.uptime || "99.8%"}</div>
                <p className="text-xs text-muted-foreground">Average uptime across all endpoints</p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/reports/uptime" className="text-xs text-primary flex items-center">
                  View detailed report
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.metrics?.avgResponseTime || "245ms"}</div>
                <p className="text-xs text-muted-foreground">Average response time across all endpoints</p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/reports/performance" className="text-xs text-primary flex items-center">
                  View detailed report
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failures</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.metrics?.failures || "3"}</div>
                <p className="text-xs text-muted-foreground">Failures detected in the last 24 hours</p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/reports/failures" className="text-xs text-primary flex items-center">
                  View detailed report
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
