import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EndpointsList } from "@/components/endpoints-list"

export default function EndpointsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Endpoints</h1>
        <Button size="sm" asChild>
          <Link href="/dashboard/endpoints/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search endpoints..." className="max-w-sm" />
      </div>

      <EndpointsList />
    </div>
  )
}
