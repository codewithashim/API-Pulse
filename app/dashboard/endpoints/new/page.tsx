"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function NewEndpointPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [method, setMethod] = useState("GET")
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
    frequency: "hourly",
    headers: "",
    payload: "",
    timeout: 30,
    retryOnFailure: true,
    notifications: true,
    notifyOnFailure: true,
    notifyOnRecovery: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "method") {
      setMethod(value)
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to create the endpoint
      // const response = await fetch('/api/endpoints', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Endpoint created",
        description: "Your endpoint has been created successfully.",
      })

      router.push("/dashboard/endpoints")
    } catch (error) {
      console.error("Failed to create endpoint:", error)
      toast({
        title: "Failed to create endpoint",
        description: "An error occurred while creating your endpoint.",
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
          <Link href="/dashboard/endpoints">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Endpoint</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Details</CardTitle>
            <CardDescription>Configure the endpoint you want to monitor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My API Endpoint"
                required
              />
              <p className="text-xs text-muted-foreground">A friendly name to identify this endpoint</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://api.example.com/endpoint"
                required
              />
              <p className="text-xs text-muted-foreground">The full URL of the endpoint to monitor</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select
                  defaultValue="GET"
                  onValueChange={(value) => handleSelectChange("method", value)}
                  value={formData.method}
                >
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Ping Frequency</Label>
                <Select
                  defaultValue="hourly"
                  onValueChange={(value) => handleSelectChange("frequency", value)}
                  value={formData.frequency}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="30min">Every 30 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="headers" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="payload" disabled={method === "GET"}>
                  Payload
                </TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Request Headers</Label>
                  <Textarea
                    name="headers"
                    value={formData.headers}
                    onChange={handleChange}
                    placeholder={`Content-Type: application/json\nAuthorization: Bearer token`}
                    className="font-mono text-sm"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">Add custom headers in key: value format, one per line</p>
                </div>
              </TabsContent>
              <TabsContent value="payload" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Request Payload</Label>
                  <Textarea
                    name="payload"
                    value={formData.payload}
                    onChange={handleChange}
                    placeholder={`{\n  "key": "value"\n}`}
                    className="font-mono text-sm"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">JSON payload to send with the request</p>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Retry on Failure</Label>
                    <p className="text-xs text-muted-foreground">Automatically retry failed requests</p>
                  </div>
                  <Switch
                    checked={formData.retryOnFailure}
                    onCheckedChange={(checked) => handleSwitchChange("retryOnFailure", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send notifications on failure</p>
                  </div>
                  <Switch
                    checked={formData.notifications}
                    onCheckedChange={(checked) => handleSwitchChange("notifications", checked)}
                  />
                </div>

                {formData.notifications && (
                  <div className="ml-6 space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notify on Failure</Label>
                        <p className="text-xs text-muted-foreground">Send notification when endpoint fails</p>
                      </div>
                      <Switch
                        checked={formData.notifyOnFailure}
                        onCheckedChange={(checked) => handleSwitchChange("notifyOnFailure", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notify on Recovery</Label>
                        <p className="text-xs text-muted-foreground">Send notification when endpoint recovers</p>
                      </div>
                      <Switch
                        checked={formData.notifyOnRecovery}
                        onCheckedChange={(checked) => handleSwitchChange("notifyOnRecovery", checked)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    name="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/endpoints">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Endpoint"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
