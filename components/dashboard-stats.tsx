import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle, Clock, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStatsProps {
  isLoading: boolean
  data?: {
    totalEndpoints: number
    healthyEndpoints: number
    failingEndpoints: number
    nextPingIn: string
    endpointsGrowth: number
  }
}

export function DashboardStats({ isLoading, data }: DashboardStatsProps) {
  // Default values if data is not available
  const stats = {
    totalEndpoints: data?.totalEndpoints || 0,
    healthyEndpoints: data?.healthyEndpoints || 0,
    failingEndpoints: data?.failingEndpoints || 0,
    nextPingIn: data?.nextPingIn || "N/A",
    endpointsGrowth: data?.endpointsGrowth || 0,
  }

  // Calculate percentages
  const healthyPercentage =
    stats.totalEndpoints > 0 ? Math.round((stats.healthyEndpoints / stats.totalEndpoints) * 100) : 0

  const failingPercentage =
    stats.totalEndpoints > 0 ? Math.round((stats.failingEndpoints / stats.totalEndpoints) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalEndpoints}</div>
              <p className="text-xs text-muted-foreground">
                {stats.endpointsGrowth > 0
                  ? `+${stats.endpointsGrowth} from last month`
                  : stats.endpointsGrowth < 0
                    ? `${stats.endpointsGrowth} from last month`
                    : "No change from last month"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Healthy</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.healthyEndpoints}</div>
              <p className="text-xs text-muted-foreground">{healthyPercentage}% of all endpoints</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failing</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.failingEndpoints}</div>
              <p className="text-xs text-muted-foreground">{failingPercentage}% of all endpoints</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Ping</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.nextPingIn}</div>
              <p className="text-xs text-muted-foreground">Until next scheduled ping</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
