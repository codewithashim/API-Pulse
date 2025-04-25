"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus, Users, UserPlus, Settings, MoreHorizontal, Check, X, Loader2 } from "lucide-react"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function TeamsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<Record<string, any[]>>({})
  const [isLoadingMembers, setIsLoadingMembers] = useState<Record<string, boolean>>({})

  // Fetch teams data
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        setIsLoading(true)

        // Fetch teams
        const teamsResponse = await fetch("/api/teams")
        if (!teamsResponse.ok) throw new Error("Failed to fetch teams")
        const teamsData = await teamsResponse.json()
        setTeams(teamsData.teams || [])

        // Fetch invitations
        const invitationsResponse = await fetch("/api/teams/invitations")
        if (!invitationsResponse.ok) throw new Error("Failed to fetch invitations")
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData.invitations || [])
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
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
        }),
      })

      if (!response.ok) throw new Error("Failed to create team")

      const data = await response.json()
      setTeams([...teams, data.team])
      setNewTeamName("")
      setNewTeamDescription("")
      setCreateTeamOpen(false)

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

      setInviteEmail("")
      setInviteDialogOpen(false)

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
      setInvitations(invitations.filter((inv) => inv._id !== invitationId))

      // If accepted, update teams list
      if (accept) {
        const data = await response.json()
        setTeams([...teams, data.team])
      }

      toast({
        title: accept ? "Invitation accepted" : "Invitation declined",
        description: accept ? "You have successfully joined the team." : "You have declined the invitation.",
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

  // Fetch team members
  const fetchTeamMembers = async (teamId: string) => {
    if (teamMembers[teamId]) return // Already fetched

    try {
      setIsLoadingMembers((prev) => ({ ...prev, [teamId]: true }))

      const response = await fetch(`/api/teams/${teamId}/members`)
      if (!response.ok) throw new Error("Failed to fetch team members")

      const data = await response.json()
      setTeamMembers((prev) => ({ ...prev, [teamId]: data.members || [] }))
    } catch (error) {
      console.error("Error fetching team members:", error)
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMembers((prev) => ({ ...prev, [teamId]: false }))
    }
  }

  // Remove member from team
  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove team member")

      // Update team members list
      setTeamMembers((prev) => ({
        ...prev,
        [teamId]: prev[teamId].filter((member: any) => member.userId !== userId),
      }))

      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Leave team
  const handleLeaveTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to leave team")

      // Remove team from list
      setTeams(teams.filter((team) => team._id !== teamId))

      toast({
        title: "Team left",
        description: "You have successfully left the team.",
      })
    } catch (error) {
      console.error("Error leaving team:", error)
      toast({
        title: "Error",
        description: "Failed to leave team. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get user role in team
  const getUserRole = (team: any) => {
    const member = team.members?.find((m: any) => m.userId === session?.user?.id)
    return member?.role || "member"
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <Button size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading teams...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description (Optional)</Label>
                <Input
                  id="team-description"
                  placeholder="Enter team description"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={isCreatingTeam}>
                {isCreatingTeam ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-teams">
        <TabsList>
          <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {invitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-teams" className="mt-4">
          {teams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="rounded-full bg-muted p-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No teams yet</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  You haven't created or joined any teams yet. Create a team to collaborate with others.
                </p>
                <Button className="mt-4" onClick={() => setCreateTeamOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card key={team._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{team.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTeam(team)
                              setInviteDialogOpen(true)
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Member
                          </DropdownMenuItem>
                          {getUserRole(team) === "owner" && (
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Team Settings
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleLeaveTeam(team._id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Leave Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{team.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getUserRole(team)}</Badge>
                      <span className="text-xs text-muted-foreground">{team.endpoints?.length || 0} endpoints</span>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Team Members</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => fetchTeamMembers(team._id)}
                        >
                          {isLoadingMembers[team._id] ? <Loader2 className="h-3 w-3 animate-spin" /> : "View All"}
                        </Button>
                      </div>

                      {teamMembers[team._id] ? (
                        <div className="flex -space-x-2 overflow-hidden">
                          {teamMembers[team._id].slice(0, 5).map((member: any, i: number) => (
                            <Avatar key={i} className="border-2 border-background h-8 w-8">
                              <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name || "User")}</AvatarFallback>
                            </Avatar>
                          ))}
                          {teamMembers[team._id].length > 5 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                              +{teamMembers[team._id].length - 5}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Click "View All" to see team members</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedTeam(team)
                        setInviteDialogOpen(true)
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="rounded-full bg-muted p-3">
                  <Check className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No pending invitations</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  You don't have any pending team invitations at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{invitation.team.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInvitationResponse(invitation._id, false)}
                        >
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => handleInvitationResponse(invitation._id, true)}>
                          Accept
                        </Button>
                      </div>
                    </div>
                    <CardDescription>Invited by {invitation.inviter.name || invitation.inviter.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p>
                        You've been invited to join this team. Accepting will give you access to the team's endpoints
                        and resources.
                      </p>
                      {invitation.team.description && (
                        <div className="mt-2 rounded-md bg-muted p-3">
                          <p className="font-medium">Team Description:</p>
                          <p className="text-muted-foreground">{invitation.team.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    Invitation sent {new Date(invitation.createdAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Invite someone to join your team by email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-select">Team</Label>
              <Select
                value={selectedTeam?._id || ""}
                onValueChange={(value) => {
                  const team = teams.find((t) => t._id === value)
                  setSelectedTeam(team)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={isInviting || !selectedTeam || !inviteEmail}>
              {isInviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
