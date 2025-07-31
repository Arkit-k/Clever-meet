"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Upload, FileText, Calendar, User, Clock, MessageSquare, Paperclip } from "lucide-react"

interface Meeting {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: string
  notes: string
  meetingUrl?: string
  client: { name: string; email: string }
  freelancer: { name: string; email: string }
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: { name: string }
}

interface FileUpload {
  id: string
  filename: string
  originalName: string
  size: number
  createdAt: string
  uploader: { name: string }
}

export default function MeetingBoardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [notes, setNotes] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchMeetingData()

    // Load messages after initial meeting data
    setTimeout(() => {
      fetchMessages()
    }, 500)

    // Reduced polling - only poll for messages every 10 seconds
    const messagesInterval = setInterval(fetchMessages, 10000)

    // Poll for meeting updates every 2 minutes (reduced frequency)
    const meetingInterval = setInterval(fetchMeetingData, 120000)

    // Check if this is a client approval redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('approved') === 'true') {
      alert("🎉 Great! You've approved this freelancer. Welcome to your collaboration workspace!")
    }

    return () => {
      clearInterval(messagesInterval)
      clearInterval(meetingInterval)
    }
  }, [session, status, router, meetingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMeetingData = async () => {
    setIsLoading(true)
    try {
      // Only fetch meeting data initially, load messages/files on demand
      const meetingRes = await fetch(`/api/meetings/${meetingId}`)

      if (meetingRes.ok) {
        const meetingData = await meetingRes.json()
        setMeeting(meetingData.meeting)
        setNotes(meetingData.meeting.notes || "")
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      // Silent error handling
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSendingMessage(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const saveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        alert("Notes saved successfully!")
      }
    } catch (error) {
      console.error("Error saving notes:", error)
      alert("Failed to save notes")
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/meetings/${meetingId}/files`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        fetchMeetingData() // Refresh to get new file
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file")
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
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
                  {new Date(meeting.scheduledAt).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {meeting.duration} minutes
                </span>
              </CardDescription>
            </div>
            <Button onClick={() => router.back()} variant="outline">
              ← Back to Meetings
            </Button>
          </div>
        </CardHeader>
        {meeting.description && (
          <CardContent>
            <p className="text-muted-foreground">{meeting.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Time-Based Meeting Link */}
      {(() => {
        const now = new Date()
        const meetingTime = new Date(meeting.scheduledAt)
        const oneHourBefore = new Date(meetingTime.getTime() - 60 * 60 * 1000)
        const timeUntilMeeting = meetingTime.getTime() - now.getTime()
        const timeUntilLinkAvailable = oneHourBefore.getTime() - now.getTime()
        const isLinkAvailable = now >= oneHourBefore
        const isMeetingTime = now >= meetingTime && timeUntilMeeting > -30 * 60 * 1000 // 30 min after meeting

        if (meeting.status === "CONFIRMED") {
          return (
            <Card className={`border-2 ${isLinkAvailable ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isLinkAvailable ? 'text-green-700' : 'text-orange-700'}`}>
                  {isLinkAvailable ? (
                    <>
                      🎥 Meeting Link Ready
                      <Badge className="bg-green-600 text-white">AVAILABLE NOW</Badge>
                    </>
                  ) : (
                    <>
                      ⏰ Meeting Link Pending
                      <Badge className="bg-orange-600 text-white">AVAILABLE IN {Math.ceil(timeUntilLinkAvailable / (1000 * 60))} MIN</Badge>
                    </>
                  )}
                </CardTitle>
                <CardDescription className={isLinkAvailable ? 'text-green-600' : 'text-orange-600'}>
                  {isLinkAvailable
                    ? "Your meeting link is now available. Click to join the meeting."
                    : `Meeting link will be available 1 hour before the meeting (${oneHourBefore.toLocaleTimeString()})`
                  }
                </CardDescription>
              </CardHeader>

              {isLinkAvailable && (
                <CardContent className="space-y-4">
                  {meeting.meetingUrl ? (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Meeting URL:</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                          {meeting.meetingUrl}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => navigator.clipboard.writeText(meeting.meetingUrl!)}
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          📋 Copy Link
                        </Button>
                        <Button
                          onClick={() => window.open(meeting.meetingUrl, '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          🚀 Join Meeting
                        </Button>
                      </div>

                      {isMeetingTime && (
                        <div className="bg-green-100 border border-green-300 p-3 rounded-lg">
                          <p className="text-green-800 font-medium">🔴 Meeting is starting now!</p>
                          <p className="text-green-700 text-sm">Click "Join Meeting" to enter the call.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-blue-800 font-medium">📞 Meeting link will be generated automatically</p>
                      <p className="text-blue-700 text-sm">A Zoom/Google Meet link will appear here when it's time for your meeting.</p>
                    </div>
                  )}
                </CardContent>
              )}

              {!isLinkAvailable && (
                <CardContent>
                  <div className="bg-orange-100 border border-orange-200 p-4 rounded-lg">
                    <p className="text-orange-800 font-medium">⏳ Please wait for the meeting link</p>
                    <p className="text-orange-700 text-sm">
                      The meeting link will become available at {oneHourBefore.toLocaleString()}
                    </p>
                    <p className="text-orange-600 text-xs mt-2">
                      You'll receive an email reminder when the link is ready.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        }
        return null
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.name === session?.user.name ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender.name === session?.user.name
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.sender.name} • {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={isSendingMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.uploader.name} • {(file.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className="mb-3"
              />
              <Button onClick={saveNotes} disabled={isSavingNotes} className="w-full">
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
