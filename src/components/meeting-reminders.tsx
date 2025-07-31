"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Calendar, User, Send, CheckCircle } from "lucide-react"

interface Meeting {
  id: string
  title: string
  scheduledAt: string
  status: string
  client: { name: string; email: string }
  freelancer: { name: string; email: string }
  reminderTime: string
  timeUntilReminder: number
  reminderScheduled: boolean
}

export function MeetingReminders() {
  const { data: session } = useSession()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchUpcomingMeetings()
    }
  }, [session])

  const fetchUpcomingMeetings = async () => {
    try {
      const response = await fetch("/api/meeting-reminders")
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendReminderNow = async (meetingId: string) => {
    setIsSending(meetingId)
    try {
      const response = await fetch("/api/meeting-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          action: "send_now"
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
      } else {
        alert("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Error sending reminder")
    } finally {
      setIsSending(null)
    }
  }

  const scheduleAllReminders = async () => {
    setIsSending("all")
    try {
      const response = await fetch("/api/meeting-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "schedule_all"
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchUpcomingMeetings() // Refresh the list
      } else {
        alert("Failed to schedule reminders")
      }
    } catch (error) {
      console.error("Error scheduling reminders:", error)
      alert("Error scheduling reminders")
    } finally {
      setIsSending(null)
    }
  }

  const formatTimeUntil = (milliseconds: number) => {
    if (milliseconds <= 0) return "Past due"
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading meeting reminders...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Meeting Reminders
          </h2>
          <p className="text-muted-foreground">
            Automatic reminders sent 1 hour before each meeting
          </p>
        </div>
        <Button
          onClick={scheduleAllReminders}
          disabled={isSending === "all"}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Clock className="h-4 w-4 mr-2" />
          Schedule All Reminders
        </Button>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Meetings</h3>
            <p className="text-muted-foreground">
              You don't have any meetings scheduled for the next 24 hours.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => {
            const isClient = session?.user.role === "CLIENT"
            const otherParty = isClient ? meeting.freelancer : meeting.client
            const meetingTime = new Date(meeting.scheduledAt)
            const reminderTime = new Date(meeting.reminderTime)
            
            return (
              <Card key={meeting.id} className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <Badge 
                      variant={meeting.status === 'CONFIRMED' ? 'default' : 'secondary'}
                      className={meeting.status === 'CONFIRMED' ? 'bg-green-600' : ''}
                    >
                      {meeting.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {otherParty.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {meetingTime.toLocaleString()}
                    </span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Reminder Info */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          📅 Reminder scheduled for:
                        </p>
                        <p className="text-sm text-blue-700">
                          {reminderTime.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600">Time until reminder:</p>
                        <p className="text-sm font-medium text-blue-800">
                          {formatTimeUntil(meeting.timeUntilReminder)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reminder Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {meeting.reminderScheduled ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">Reminder scheduled</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-700">Reminder time passed</span>
                        </>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminderNow(meeting.id)}
                      disabled={isSending === meeting.id}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Now
                    </Button>
                  </div>

                  {/* Meeting Details */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p><strong>Meeting ID:</strong> {meeting.id}</p>
                    <p><strong>Client:</strong> {meeting.client.name} ({meeting.client.email})</p>
                    <p><strong>Freelancer:</strong> {meeting.freelancer.name} ({meeting.freelancer.email})</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            How Meeting Reminders Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>• <strong>Automatic Scheduling:</strong> Reminders are automatically scheduled when meetings are booked</p>
          <p>• <strong>1 Hour Notice:</strong> Both client and freelancer receive reminders exactly 1 hour before the meeting</p>
          <p>• <strong>Multiple Channels:</strong> Reminders are sent via in-app notifications and email</p>
          <p>• <strong>Manual Override:</strong> You can send immediate reminders using the "Send Now" button</p>
          <p>• <strong>Smart Filtering:</strong> Only confirmed meetings receive automatic reminders</p>
        </CardContent>
      </Card>
    </div>
  )
}
