import { CheckCircle, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function EndpointPingsList({ endpointId }: { endpointId: string }) {
  // This would normally fetch data from an API based on the endpoint ID
  const pings = [
    {
      id: "1",
      timestamp: "2023-04-23T10:45:00Z",
      status: "Success",
      statusCode: 200,
      responseTime: "245ms",
      response: '{"status":"ok","version":"1.0.5"}',
    },
    {
      id: "2",
      timestamp: "2023-04-23T09:45:00Z",
      status: "Success",
      statusCode: 200,
      responseTime: "230ms",
      response: '{"status":"ok","version":"1.0.5"}',
    },
    {
      id: "3",
      timestamp: "2023-04-23T08:45:00Z",
      status: "Success",
      statusCode: 200,
      responseTime: "260ms",
      response: '{"status":"ok","version":"1.0.5"}',
    },
    {
      id: "4",
      timestamp: "2023-04-23T07:45:00Z",
      status: "Failed",
      statusCode: 0,
      responseTime: "Timeout",
      response: "Connection timeout after 30s",
    },
    {
      id: "5",
      timestamp: "2023-04-23T06:45:00Z",
      status: "Success",
      statusCode: 200,
      responseTime: "275ms",
      response: '{"status":"ok","version":"1.0.5"}',
    },
  ]

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response Time</TableHead>
            <TableHead>Response</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pings.map((ping) => (
            <TableRow key={ping.id}>
              <TableCell>{new Date(ping.timestamp).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {ping.status === "Success" ? (
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
              <TableCell className="max-w-[300px] truncate font-mono text-xs">{ping.response}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
