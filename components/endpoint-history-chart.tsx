"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function EndpointHistoryChart() {
  // This would normally fetch data from an API
  const data = [
    { date: "04/17", responseTime: 250, status: "success" },
    { date: "04/18", responseTime: 230, status: "success" },
    { date: "04/19", responseTime: 280, status: "success" },
    { date: "04/20", responseTime: 270, status: "success" },
    { date: "04/21", responseTime: 0, status: "failure" },
    { date: "04/22", responseTime: 310, status: "success" },
    { date: "04/23", responseTime: 245, status: "success" },
  ]

  return (
    <div className="h-[300px] w-full">
      <ChartContainer
        className="h-full"
        data={data}
        tooltip={
          <ChartTooltip>
            <ChartTooltipContent
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.status === "success" ? `${data.responseTime}ms` : "Failed"}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </ChartTooltip>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}ms`}
            />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
