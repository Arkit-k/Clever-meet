"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video, MessageSquare, ExternalLink } from "lucide-react"
import toast from 'react-hot-toast'

interface Meeting {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: string
  meetingUrl: string
  client: { name: string; email: string }
  freelancer: { name: string; email: string }
}

export default function MeetingRoomPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchMeeting()

    // Check for meeting completion every 30 seconds
    const completionInterval = setInterval(checkMeetingCompletion, 30000)
    return () => clearInterval(completionInterval)
  }, [session, status, router, meetingId])

  const fetchMeeting = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/details`)
      if (response.ok) {
        const data = await response.json()
        setMeeting(data.meeting)
      } else {
        router.push("/dashboard/meetings")
      }
    } catch (error) {
      console.error("Error fetching meeting:", error)
      router.push("/dashboard/meetings")
    } finally {
      setIsLoading(false)
    }
  }

  const checkMeetingCompletion = async () => {
    try {
      // Check if this is a discovery meeting first
      const isDiscovery = meeting?.type === 'DISCOVERY' || meeting?.duration <= 30

      if (isDiscovery) {
        // For discovery meetings, use the specific completion endpoint
        const response = await fetch(`/api/meetings/${meetingId}/complete-discovery`, {
          method: 'POST'
        })

        if (response.ok) {
          const data = await response.json()

          if (session?.user.role === "CLIENT") {
            // Redirect client to decision page
            router.push(`/client-decision/${meetingId}`)
          } else {
            // Freelancer sees a message that meeting ended
            toast.success("🔍 Discovery meeting completed! Waiting for client decision...", {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
              },
            })
            setTimeout(() => {
              router.push("/dashboard/meetings")
            }, 2000)
          }
        }
      } else {
        // Regular meeting completion
        const response = await fetch(`/api/meetings/${meetingId}/complete`)
        if (response.ok) {
          const data = await response.json()

          if (data.autoCompleted) {
            // Only redirect clients to decision page
            if (session?.user.role === "CLIENT") {
              router.push(`/client-decision/${meetingId}`)
            } else {
              // Freelancer sees a message that meeting ended
              toast.success("✅ Meeting completed! Waiting for client decision...", {
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                },
              })
              setTimeout(() => {
                router.push("/dashboard/meetings")
              }, 2000)
            }
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isUpcoming = (scheduledAt: string) => {
    const meetingTime = new Date(scheduledAt)
    const now = new Date()
    const thirtyMinutesBefore = new Date(meetingTime.getTime() - 30 * 60 * 1000)
    
    return now >= thirtyMinutesBefore && now <= meetingTime
  }

  const isMeetingTime = (scheduledAt: string) => {
    const meetingTime = new Date(scheduledAt)
    const now = new Date()
    const meetingEnd = new Date(meetingTime.getTime() + (meeting?.duration || 60) * 60 * 1000)
    
    return now >= meetingTime && now <= meetingEnd
  }

  const handleCompleteMeeting = async () => {
    if (confirm("Mark this meeting as completed? This will trigger the client decision flow.")) {
      try {
        const response = await fetch(`/api/meetings/${meetingId}/complete`, {
          method: 'POST'
        })

        if (response.ok) {
          const data = await response.json()

          if (session?.user.role === "CLIENT") {
            router.push(`/client-decision/${meetingId}`)
          } else {
            toast.success("🎉 Meeting completed! Client will now decide whether to continue collaboration.", {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
              },
            })
            setTimeout(() => {
              router.push("/dashboard/meetings")
            }, 2000)
          }
        }
      } catch (error) {
        toast.error("❌ Failed to complete meeting. Please try again.", {
          duration: 5000,
        })
      }
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!meeting) {
    return <div className="text-center py-12">Meeting not found</div>
  }

  const isClient = session?.user.role === "CLIENT"
  const otherParty = isClient ? meeting.freelancer : meeting.client

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/dashboard/meetings")}
        >
          ← Back to Meetings
        </Button>
      </div>

      {/* Meeting Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                {meeting.title}
                <Badge variant={meeting.status === "CONFIRMED" ? "default" : "secondary"}>
                  {meeting.status}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  with {otherParty.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(meeting.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {meeting.duration} minutes
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {meeting.description && (
          <CardContent>
            <p className="text-muted-foreground">{meeting.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Meeting Room */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Room</CardTitle>
          <CardDescription>
            {isMeetingTime(meeting.scheduledAt) 
              ? "Your meeting is happening now!" 
              : isUpcoming(meeting.scheduledAt)
              ? "You can join the meeting room 30 minutes before the scheduled time"
              : "Meeting room will be available 30 minutes before the scheduled time"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMeetingTime(meeting.scheduledAt) || isUpcoming(meeting.scheduledAt) ? (
            <>
              {/* For MVP, redirect to Meeting Board for collaboration */}
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <Video className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">Meeting Room Ready!</h3>
                <p className="text-green-700 mb-4">
                  For this MVP, we'll use the Meeting Board for your meeting collaboration.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push(`/meeting/${meeting.id}`)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enter Meeting Board
                  </Button>

                  {/* Complete Meeting Button - for testing the flow */}
                  {meeting.status === "CONFIRMED" && (
                    <Button
                      onClick={handleCompleteMeeting}
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Complete Meeting (Test)
                    </Button>
                  )}
                </div>
              </div>

              {/* Future: Video conferencing integration */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🚀 Coming Soon: Video Integration</h4>
                <p className="text-sm text-blue-700">
                  In the full version, this will integrate with Zoom, Whereby, or other video platforms
                  for seamless video conferencing.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Meeting Room Not Yet Available</h3>
              <p className="text-gray-500 mb-4">
                The meeting room will open 30 minutes before your scheduled time.
              </p>
              <p className="text-sm text-gray-400">
                Scheduled for: {formatDate(meeting.scheduledAt)}
              </p>
            </div>
          )}

          {/* Meeting Link */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Meeting Link</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <code className="flex-1 text-sm font-mono">{meeting.meetingUrl}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(meeting.meetingUrl)}
              >
                Copy Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this link with participants to join the meeting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push(`/meeting/${meeting.id}`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Meeting Board
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/meetings")}
            >
              All Meetings
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`mailto:${otherParty.email}`, '_blank')}
            >
              Email {otherParty.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
