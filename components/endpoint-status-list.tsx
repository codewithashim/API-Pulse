import Link from "next/link"
import { Activity, ArrowUpRight, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface EndpointStatusListProps {
  isLoading: boolean
  endpoints?: Array<{
    _id: string
    name: string
    url: string
    method: string
    status: string
    lastPing: string
    nextPing: string
    responseTime: string
  }>
}

export function EndpointStatusList({ isLoading, endpoints = [] }: EndpointStatusListProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-4 flex justify-end">
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // If no endpoints, show empty state
  if (endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium">No endpoints found</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first endpoint to monitor.</p>
        <Link
          href="/dashboard/endpoints/new"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Endpoint
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {endpoints.map((endpoint) => (
        <Card key={endpoint._id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">{endpoint.name}</CardTitle>
              <CardDescription className="text-xs truncate max-w-[200px]">{endpoint.url}</CardDescription>
            </div>
            <Badge variant={endpoint.status === "Healthy" ? "default" : "destructive"}>{endpoint.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Response:</span>
                <span className="font-medium">{endpoint.responseTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Next ping:</span>
                <span className="font-medium">{endpoint.nextPing}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                href={`/dashboard/endpoints/${endpoint._id}`}
                className="text-xs text-primary flex items-center hover:underline"
              >
                View details
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
