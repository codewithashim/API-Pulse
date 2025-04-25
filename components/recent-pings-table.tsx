import { CheckCircle, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentPingsTableProps {
  isLoading: boolean
  pings?: Array<{
    _id: string
    endpoint: {
      _id: string
      name: string
      url: string
    }
    timestamp: string
    status: string
    statusCode: number | null
    responseTime: string
  }>
}

export function RecentPingsTable({ isLoading, pings = [] }: RecentPingsTableProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endpoint</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Show skeleton UI while loading
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
              </TableRow>
            ))
          ) : pings.length === 0 ? (
            // Show empty state if no pings
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No recent pings found
              </TableCell>
            </TableRow>
          ) : (
            // Show actual ping data
            pings.map((ping) => (
              <TableRow key={ping._id}>
                <TableCell className="font-medium">{ping.endpoint.name}</TableCell>
                <TableCell>{formatDate(ping.timestamp)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {ping.status === "success" ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{ping.statusCode}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{ping.statusCode || "Timeout"}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>{ping.responseTime}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
