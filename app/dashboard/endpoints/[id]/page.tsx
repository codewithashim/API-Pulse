"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Bell, ChevronLeft, Clock, Edit, ExternalLink, RefreshCw, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EndpointHistoryChart } from "@/components/endpoint-history-chart"
import { EndpointPingsList } from "@/components/endpoint-pings-list"
import { useToast } from "@/hooks/use-toast"

export default function EndpointDetailsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isPinging, setIsPinging] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [endpoint, setEndpoint] = useState<any>(null)

  // Fetch endpoint data
  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        // In a real app, this would fetch from your API
        // const response = await fetch(`/api/endpoints/${params.id}`)
        // const data = await response.json()
        // setEndpoint(data)

        // For demo purposes, we'll use mock data
        setEndpoint({
          id: params.id,
          name: "Production API",
          url: "https://api.example.com/v1/status",
          method: "GET",
          frequency: "Hourly",
          status: "Healthy",
          lastPing: new Date().toISOString(),
          nextPing: new Date(Date.now() + 3600000).toISOString(),
          uptime: "99.8%",
          avgResponseTime: "245ms",
          successCount: 142,
          failureCount: 3,
          notifications: true,
        })
      } catch (error) {
        console.error("Failed to fetch endpoint:", error)
        toast({
          title: "Error",
          description: "Failed to fetch endpoint details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEndpoint()
  }, [params.id, toast])

  const handlePingEndpoint = async () => {
    setIsPinging(true)
    try {
      // In a real app, this would ping the endpoint via your API
      // await fetch(`/api/endpoints/${params.id}/ping`, {
      //   method: "POST",
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Endpoint pinged successfully",
      })
    } catch (error) {
      console.error("Failed to ping endpoint:", error)
      toast({
        title: "Error",
        description: "Failed to ping endpoint",
        variant: "destructive",
      })
    } finally {
      setIsPinging(false)
    }
  }

  const handleTestNotification = async () => {
    setIsSendingNotification(true)
    try {
      // In a real app, this would send a test notification via your API
      // await fetch(`/api/endpoints/${params.id}/test-notification`, {
      //   method: "POST",
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Test notification sent successfully",
      })
    } catch (error) {
      console.error("Failed to send test notification:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setIsSendingNotification(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!endpoint) {
    return <div>Endpoint not found</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/endpoints">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{endpoint.name}</h1>
        <Badge variant={endpoint.status === "Healthy" ? "default" : "destructive"} className="ml-2">
          {endpoint.status}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="font-medium">URL:</span>
          <a
            href={endpoint.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            {endpoint.url}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
        <div>
          <span className="font-medium">Method:</span> {endpoint.method}
        </div>
        <div>
          <span className="font-medium">Frequency:</span> {endpoint.frequency}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="font-medium">Next ping:</span> {new Date(endpoint.nextPing).toLocaleTimeString()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handlePingEndpoint} disabled={isPinging}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isPinging ? "animate-spin" : ""}`} />
          {isPinging ? "Pinging..." : "Ping Now"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleTestNotification} disabled={isSendingNotification}>
          <Bell className="mr-2 h-4 w-4" />
          {isSendingNotification ? "Sending..." : "Test Notification"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoint.uptime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoint.avgResponseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success / Failure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-green-500">{endpoint.successCount}</span>
              {" / "}
              <span className="text-red-500">{endpoint.failureCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Time History</CardTitle>
          <CardDescription>Response time over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <EndpointHistoryChart />
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Ping History</TabsTrigger>
          <TabsTrigger value="settings">Endpoint Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-4">
          <EndpointPingsList endpointId={params.id as string} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Settings</CardTitle>
              <CardDescription>Manage your endpoint configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="gap-1" asChild>
                  <Link href={`/dashboard/endpoints/${params.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" className="gap-1">
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </div>

              <div className="rounded-md bg-muted p-4">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      name: endpoint.name,
                      url: endpoint.url,
                      method: endpoint.method,
                      frequency: endpoint.frequency,
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer ***********",
                      },
                      timeout: 30,
                      retryOnFailure: true,
                      notifications: endpoint.notifications,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
