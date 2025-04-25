"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle, Clock, Edit, MoreHorizontal, Trash, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EndpointsList() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [deleteEndpointId, setDeleteEndpointId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchEndpoints()
  }, [])

  const fetchEndpoints = async () => {
    try {
      const response = await fetch("/api/endpoints")
      if (!response.ok) {
        throw new Error("Failed to fetch endpoints")
      }
      const data = await response.json()
      setEndpoints(data)
    } catch (error) {
      console.error("Error fetching endpoints:", error)
      toast({
        title: "Error",
        description: "Failed to load endpoints. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEndpoint = async () => {
    if (!deleteEndpointId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/endpoints/${deleteEndpointId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete endpoint")
      }

      // Remove the deleted endpoint from the state
      setEndpoints(endpoints.filter((endpoint) => endpoint._id !== deleteEndpointId))

      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting endpoint:", error)
      toast({
        title: "Error",
        description: "Failed to delete endpoint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteEndpointId(null)
    }
  }

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Ping</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Ping</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint) => (
              <TableRow key={endpoint._id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/endpoints/${endpoint._id}`} className="hover:underline flex items-center">
                    {endpoint.name}
                    <ArrowUpRight className="ml-1 h-3 w-3 text-muted-foreground" />
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{endpoint.url}</TableCell>
                <TableCell>{endpoint.method}</TableCell>
                <TableCell>{endpoint.frequency}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {endpoint.status === "Healthy" ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          Healthy
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        >
                          Failing
                        </Badge>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {endpoint.nextPing}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/endpoints/${endpoint._id}`}>
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/endpoints/${endpoint._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteEndpointId(endpoint._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog
        open={!!deleteEndpointId}
        onOpenChange={(open) => {
          if (!open) setDeleteEndpointId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the endpoint and all associated ping history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEndpoint}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
