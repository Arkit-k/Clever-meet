"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, ExternalLink, Copy } from "lucide-react"

interface Meeting {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  meetingUrl: string | null
  client: {
    name: string
    email: string
  }
  freelancer: {
    name: string
    email: string
  }
}

export default function MeetingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    fetchMeetings()
  }, [session, status, router])

  const fetchMeetings = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Fetching meetings for user:", session?.user.name, session?.user.role)
      const response = await fetch("/api/meetings")
      console.log("📅 Meetings API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("📅 Meetings data received:", data)
        setMeetings(data.meetings || [])
      } else {
        console.error("❌ Failed to fetch meetings:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("❌ Error fetching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMeetingStatus = async (meetingId: string, status: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchMeetings() // Refresh the list
      }
    } catch (error) {
      console.error("Error updating meeting:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const copyMeetingLink = async (meetingUrl: string) => {
    try {
      await navigator.clipboard.writeText(meetingUrl)
      alert("Meeting link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy meeting link:", error)
      alert("Failed to copy meeting link")
    }
  }

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date()
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isFreelancer = session?.user.role === "FREELANCER"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isFreelancer ? "Meeting Requests" : "My Meetings"}
        </h1>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
            <p className="text-muted-foreground">
              {isFreelancer 
                ? "Meeting requests from clients will appear here" 
                : "Book meetings with freelancers to get started"
              }
            </p>
            {!isFreelancer && (
              <Button 
                className="mt-4"
                onClick={() => router.push("/dashboard/freelancers")}
              >
                Find Freelancers
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {meeting.title}
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {isFreelancer ? meeting.client.name : meeting.freelancer.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(meeting.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.duration} minutes
                      </span>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Type: {meeting.duration === 0 ? 'Collaboration' :
                                meeting.duration === 15 ? 'Discovery' : 'Traditional'}
                        </span>
                      )}
                    </CardDescription>

                    {/* Meeting Link - Show for upcoming meetings with links */}
                    {meeting.meetingUrl && isUpcoming(meeting.scheduledAt) && meeting.duration > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Meeting Link Ready</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyMeetingLink(meeting.meetingUrl!)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => window.open(meeting.meetingUrl!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 font-mono break-all">
                          {meeting.meetingUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {meeting.description}
                  </p>
                )}

                <div className="flex gap-2">
                  {/* Meeting Board - ONLY for approved collaborations (duration = 0 AND title contains "Collaboration") */}
                  {meeting.status === "CONFIRMED" &&
                   meeting.duration === 0 &&
                   meeting.title.includes("Collaboration") && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/meeting/${meeting.id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      🚀 Join Meeting Board
                    </Button>
                  )}

                  {/* Traditional meeting requests - NOT discovery calls */}
                  {isFreelancer && meeting.status === "PENDING" && meeting.duration > 0 && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateMeetingStatus(meeting.id, "CONFIRMED")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Meeting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMeetingStatus(meeting.id, "CANCELLED")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}

                  {/* Regular confirmed meetings (not collaboration boards and NOT 15-min discovery calls) */}
                  {meeting.status === "CONFIRMED" && meeting.duration > 15 && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/meeting/${meeting.id}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Join Meeting Room
                      </Button>
                      {isFreelancer && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMeetingStatus(meeting.id, "COMPLETED")}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </>
                  )}

                  {/* Show info for regular meetings (not collaboration boards, not discovery calls) */}
                  {meeting.status === "CONFIRMED" &&
                   meeting.duration > 15 &&
                   !meeting.title.includes("Collaboration") && (
                    <div className="text-sm text-muted-foreground bg-yellow-50 p-2 rounded">
                      📅 Regular meeting - use Cal.com for discovery calls instead
                    </div>
                  )}

                  {/* Handle 15-minute meetings (discovery calls) */}
                  {meeting.duration === 15 && (
                    <div className="text-sm text-muted-foreground bg-orange-50 p-2 rounded">
                      📞 Discovery call completed - use approval flow for collaboration
                    </div>
                  )}

                  {/* Reviews for completed collaboration projects */}
                  {meeting.status === "COMPLETED" &&
                   !isFreelancer &&
                   meeting.duration === 0 &&
                   (meeting.title.includes("Collaboration") || meeting.title.includes("Project")) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/meeting/${meeting.id}/review`)}
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
