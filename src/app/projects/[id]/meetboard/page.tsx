"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  Upload,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Send,
  Paperclip,
  Shield,
  Video,
  Activity,
  GitBranch,
  Figma
} from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  totalAmount: number
  status: string
  client: { name: string; email: string }
  freelancer: { name: string; email: string }
  milestones: Array<{
    id: string
    title: string
    description: string
    amount: number
    status: string
    dueDate: string
  }>
}

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  createdAt: string
}

export default function ProjectMeetboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (session) {
      fetchProject()
      fetchMessages()
      // Reduced polling - every 15 seconds instead of 5
      const interval = setInterval(fetchMessages, 15000)
      return () => clearInterval(interval)
    }
  }, [session, projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        
        // Check if user has access to meetboard
        if (data.project.status !== 'CLIENT_APPROVED') {
          router.push(`/dashboard/projects/${projectId}`)
          return
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      // Silent error handling
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim()
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages() // Refresh messages
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsSending(false)
    }
  }

  const calculateProgress = () => {
    if (!project?.milestones.length) return 0
    const completed = project.milestones.filter(m => m.status === 'APPROVED').length
    return (completed / project.milestones.length) * 100
  }

  const getTotalEarned = () => {
    if (!project?.milestones.length) return 0
    return project.milestones
      .filter(m => m.status === 'APPROVED')
      .reduce((sum, m) => sum + m.amount, 0)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading meetboard...</div>
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              This meetboard is only accessible after client approval.
            </p>
            <Button onClick={() => router.push("/dashboard/projects")}>
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isClient = session?.user.role === "CLIENT"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {project.title} - Meetboard
            </h1>
            <p className="text-slate-600">
              Collaboration workspace for {isClient ? project.freelancer.name : project.client.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
              <Shield className="h-3 w-3 mr-1" />
              Client Approved
            </Badge>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
              className="border-slate-300 hover:bg-slate-50"
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Activity Feed */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Activity className="h-5 w-5 text-violet-600" />
                Live Work Activity
              </CardTitle>
              <CardDescription className="text-slate-600">
                Real-time updates from connected tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* GitHub Activity */}
                <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 hover:shadow-sm transition-all">
                  <div className="p-1 bg-slate-900 rounded">
                    <GitBranch className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-800 font-semibold">GitHub:</span>
                    <span className="text-slate-600 ml-1">Pushed 3 commits to main branch</span>
                  </div>
                  <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-full">2 min ago</span>
                </div>

                {/* Figma Activity */}
                <div className="flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-sm transition-all">
                  <div className="p-1 bg-purple-600 rounded">
                    <Figma className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-purple-800 font-semibold">Figma:</span>
                    <span className="text-slate-600 ml-1">Updated homepage wireframes</span>
                  </div>
                  <span className="text-slate-400 text-xs bg-purple-100 px-2 py-1 rounded-full">15 min ago</span>
                </div>

                {/* Google Drive Activity */}
                <div className="flex items-center gap-3 text-sm p-2 bg-blue-50 rounded">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <span className="text-blue-700 font-medium">Drive:</span>
                    <span className="text-gray-600 ml-1">Shared project_assets.zip</span>
                  </div>
                  <span className="text-gray-400 text-xs">1 hour ago</span>
                </div>

                {/* Google Meet Activity */}
                <div className="flex items-center gap-3 text-sm p-2 bg-green-50 rounded">
                  <Video className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <span className="text-green-700 font-medium">Meet:</span>
                    <span className="text-gray-600 ml-1">Client started video call</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    Join
                  </Button>
                </div>

                {/* VS Code Activity */}
                <div className="flex items-center gap-3 text-sm p-2 bg-yellow-50 rounded">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <span className="text-yellow-700 font-medium">VS Code:</span>
                    <span className="text-gray-600 ml-1">Currently editing: app.js</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {/* Milestone Activity */}
                <div className="flex items-center gap-3 text-sm p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <span className="text-green-700 font-medium">Milestone:</span>
                    <span className="text-gray-600 ml-1">Design Phase completed</span>
                  </div>
                  <span className="text-gray-400 text-xs">2 hours ago</span>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="border-t pt-3 mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">8</div>
                    <div className="text-xs text-gray-500">Commits Today</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">3.2h</div>
                    <div className="text-xs text-gray-500">Active Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Project Progress */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                  <span className="text-sm text-slate-500">
                    {project.milestones.filter(m => m.status === 'APPROVED').length} / {project.milestones.length} milestones
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-3 bg-slate-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Value: <span className="font-semibold text-slate-800">${project.totalAmount}</span></span>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    Earned: ${getTotalEarned()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Chat with File Upload */}
          <Card className="flex-1 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Project Meetboard Chat
              </CardTitle>
              <CardDescription className="text-slate-600">
                Real-time communication, file sharing, and collaboration with your {isClient ? "freelancer" : "client"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-96 overflow-y-auto border border-slate-200 rounded-xl p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white/50 backdrop-blur-sm">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-slate-700">Welcome to your project meetboard!</p>
                      <p className="text-sm mt-2 text-slate-500">Start chatting, share files, and collaborate in real-time</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === session?.user.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm ${
                            message.senderId === session?.user.id
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                              : "bg-white/80 border border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              message.senderId === session?.user.id ? "bg-blue-200" : "bg-emerald-500"
                            }`} />
                            <span className={`text-xs font-medium ${
                              message.senderId === session?.user.id ? "text-blue-100" : "text-slate-600"
                            }`}>
                              {message.senderName}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.senderId === session?.user.id ? "text-blue-200" : "text-slate-500"
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Enhanced Message Input with File Upload */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message... (Press Enter to send)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        className="pr-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm rounded-xl"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-slate-100 text-slate-500"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            alert(`Selected ${files.length} file(s): ${files.map(f => f.name).join(', ')}`)
                            // TODO: Implement file upload
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={isSending || !newMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm rounded-xl px-6"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 text-xs p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    {isClient ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300"
                          onClick={() => {
                            const meetUrl = `https://whereby.com/clearaway-${project?.id}`
                            setNewMessage(`🎥 Started instant video call: ${meetUrl} - Join now!`)
                            window.open(meetUrl, '_blank')
                          }}
                        >
                          🎥 Start Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("📋 Please share the latest project requirements and any updates.")}
                        >
                          📋 Request Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("💰 Great work! Payment has been released for the completed milestone.")}
                        >
                          💰 Release Payment
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("📋 Here's the latest progress update: [Share your current work status]")}
                        >
                          📋 Share Progress
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("🎨 New design uploaded to Figma: [Share Figma link]")}
                        >
                          🎨 Share Design
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("💻 Code pushed to GitHub: [Share repository link]")}
                        >
                          💻 Share Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7"
                          onClick={() => setNewMessage("💰 Milestone completed! Ready for review and payment release.")}
                        >
                          💰 Request Payment
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Integrations */}
          {isClient && (
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Video className="h-5 w-5 text-emerald-600" />
                  Client Tools
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Launch meetings and manage project tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {/* Video Call Integration */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                  onClick={() => {
                    const meetingUrl = project?.meetingUrl || `https://whereby.com/clearaway-${project?.id}`
                    window.open(meetingUrl, '_blank')
                    // Send meeting link to chat
                    setNewMessage(`🎥 Started video call: ${meetingUrl}`)
                  }}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Video Call
                </Button>



                {/* Calendar Integration */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(project?.title || 'Project Meeting')}&details=${encodeURIComponent('Project discussion for ' + project?.title)}`
                    window.open(calendarUrl, '_blank')
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>


              </CardContent>
            </Card>
          )}

          {/* Freelancer Integrations */}
          {!isClient && (
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Activity className="h-5 w-5 text-violet-600" />
                  Work Tools
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Connect your work tools to show progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {/* Essential Work Tools */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  GitHub
                </Button>

                {/* VS Code Integration */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://vscode.dev', '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    VS Code Web
                  </Button>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Currently coding
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Notes
              </CardTitle>
              <CardDescription>
                Shared notes and important information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Add project notes, requirements, or important information..."
                  rows={4}
                  className="resize-none"
                />
                <Button size="sm" className="w-full">
                  Save Notes
                </Button>

                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">📝 Recent Notes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-700">Initial project requirements discussed</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Project Team & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Team & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-sm text-muted-foreground">{project.client.name}</p>
                    <p className="text-xs text-muted-foreground">{project.client.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Freelancer</p>
                    <p className="text-sm text-muted-foreground">{project.freelancer.name}</p>
                    <p className="text-xs text-muted-foreground">{project.freelancer.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Working</span>
                  </div>
                </div>
              </div>

              {/* Integration Status */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Connected Tools</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3 text-gray-900" />
                    <span>GitHub</span>
                    <div className="w-1 h-1 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Figma className="h-3 w-3 text-purple-600" />
                    <span>Figma</span>
                    <div className="w-1 h-1 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-3 w-3 text-blue-600" />
                    <span>G Meet</span>
                    <div className="w-1 h-1 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Upload className="h-3 w-3 text-blue-600" />
                    <span>Drive</span>
                    <div className="w-1 h-1 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <Badge 
                        variant={milestone.status === 'APPROVED' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {milestone.status === 'APPROVED' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {milestone.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">${milestone.amount}</span>
                      {milestone.dueDate && (
                        <span className="text-muted-foreground">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced File Sharing */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="h-5 w-5 text-orange-600" />
                Project Files & Assets
              </CardTitle>
              <CardDescription className="text-slate-600">
                Share designs, documents, and project assets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Drop files here or click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports images, documents, videos (max 10MB each)
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 border-blue-300 text-blue-600 hover:bg-blue-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>

                {/* File Categories */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">📋 Project Documents</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>Project Requirements.pdf</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">🎨 Design Assets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                        Drop images here
                      </div>
                      <div className="aspect-square bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                        Drop images here
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">💻 Code & Resources</h4>
                    <div className="text-center text-sm text-muted-foreground py-4 border rounded border-dashed">
                      No code files uploaded yet
                    </div>
                  </div>
                </div>

                {/* File Upload Stats */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Storage Used</span>
                    <span className="font-medium">2.3 MB / 100 MB</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '2.3%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
