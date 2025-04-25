"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TeamsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [newTeamName, setNewTeamName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  // Fetch teams data
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch teams
        const teamsResponse = await fetch("/api/teams")
        if (!teamsResponse.ok) throw new Error("Failed to fetch teams")
        const teamsData = await teamsResponse.json()
        setTeams(teamsData.teams)
        
        // Fetch invitations
        const invitationsResponse = await fetch("/api/teams/invitations")
        if (!invitationsResponse.ok) throw new Error("Failed to fetch invitations")
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData.invitations)
        
      } catch (error) {
        console.error("Error fetching teams data:", error)
        toast({
          title: "Error",
          description: "Failed to load teams data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchTeamsData()
    }
  }, [session, toast])

  // Create new team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreatingTeam(true)
      
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTeamName }),
      })
      
      if (!response.ok) throw new Error("Failed to create team")
      
      const data = await response.json()
      setTeams([...teams, data.team])
      setNewTeamName("")
      
      toast({
        title: "Team created",
        description: `Team "${data.team.name}" has been created successfully.`,
      })
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTeam(false)
    }
  }

  // Invite user to team
  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please enter an email address and select a team.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsInviting(true)
      
      const response = await fetch(`/api/teams/${selectedTeam._id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inviteEmail }),
      })
      
      if (!response.ok) throw new Error("Failed to send invitation")
      
      const data = await response.json()
      setInviteEmail("")
      
      toast({
        title: "Invitation sent",
        description: `Invitation has been sent to ${inviteEmail}.`,
      })
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  // Handle invitation response
  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/teams/invitations/${invitationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accept }),
      })
      
      if (!response.ok) throw new Error(`Failed to ${accept ? "accept" : "decline"} invitation`)
      
      // Update invitations list
      setInvitations(invitations.filter(inv => inv._id !== invitationId))
      
      // If accepted, update teams list
      if (accept) {
        const data = await response.json()
        setTeams([...teams, data.team])
      }
      
      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept 
          ? "You have successfully joined the team." 
          : "You have declined the invitation.",
      })
    } catch (error) {
      console.error("Error handling invitation:", error)
      toast({
        title: "Error",
        description: `Failed to ${accept ? "accept" : "decline"} invitation. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with others on monitoring endpoints.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input 
                  id="team-name" 
                  placeholder="Enter team name" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}


\
