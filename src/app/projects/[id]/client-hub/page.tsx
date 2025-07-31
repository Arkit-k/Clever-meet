"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalButton } from "@/components/ui/cal-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import toast from 'react-hot-toast'
import {
  Video,
  CreditCard,
  FileText,
  Calendar,
  MessageSquare,
  DollarSign,
  Shield,
  Clock,
  Users,
  Settings,
  ExternalLink,
  Upload,
  Download,
  Star,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Slack,
  Github,
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

export default function ClientHubPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user.role === "CLIENT") {
      fetchProject()
    }
  }, [session, projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        
        // Check if user has access
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

  const createStripePayment = async (amount: number) => {
    const loadingToast = toast.loading('Creating Stripe payment...', {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
      },
    })

    try {
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          amount: amount,
          description: `Payment for ${project?.title}`
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`💳 Stripe payment created successfully!\nAmount: $${amount}`, {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          },
        })
        // In a real implementation, you would redirect to Stripe Checkout
        // window.location.href = `https://checkout.stripe.com/pay/${data.clientSecret}`
      } else {
        toast.error(`❌ ${data.error || "Failed to create Stripe payment"}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error('❌ Error creating Stripe payment', {
        duration: 5000,
      })
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const createPayPalPayment = async (amount: number) => {
    const loadingToast = toast.loading('Creating PayPal order...', {
      style: {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#fff',
      },
    })

    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          amount: amount,
          description: `Payment for ${project?.title}`
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`💰 PayPal order created successfully!\nAmount: $${amount}`, {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          },
        })
        // In a real implementation, you would redirect to PayPal
        // window.location.href = `https://www.paypal.com/checkoutnow?token=${data.orderId}`
      } else {
        toast.error(`❌ ${data.error || "Failed to create PayPal payment"}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error('❌ Error creating PayPal payment', {
        duration: 5000,
      })
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const createGoogleMeet = async () => {
    const loadingToast = toast.loading('Creating Google Meet...', {
      style: {
        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
        color: '#fff',
      },
    })

    try {
      const response = await fetch('/api/integrations/google-meet/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${project?.title} - Client Meeting`,
          description: `Project discussion with ${project?.freelancer.name}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          attendeeEmails: [project?.freelancer.email]
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('📹 Google Meet created! Opening in new tab...', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          },
        })
        setTimeout(() => {
          window.open(data.meetingUrl, '_blank')
        }, 1000)
      } else {
        toast.error(`❌ ${data.error || "Failed to create Google Meet"}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error('❌ Error creating Google Meet', {
        duration: 5000,
      })
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  if (session?.user.role !== "CLIENT") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              This client hub is only accessible to project clients.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading client hub...</div>
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This project doesn't exist or you don't have access.
            </p>
            <Button onClick={() => router.push("/dashboard/projects")}>
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.title} - Client Hub
            </h1>
            <p className="text-muted-foreground">
              Manage your project with {project.freelancer.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary text-primary-foreground">
              <Shield className="h-3 w-3 mr-1" />
              Active Project
            </Badge>
            <CalButton
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
            >
              Back to Projects
            </CalButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {project.milestones.filter(m => m.status === 'APPROVED').length} / {project.milestones.length} milestones
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Value: <span className="font-semibold text-foreground">${project.totalAmount}</span></span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Paid: ${getTotalEarned()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Communication & Meetings
              </CardTitle>
              <CardDescription>
                Connect with your freelancer using various communication tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meetboard */}
                <CalButton
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(`/projects/${projectId}/meetboard`)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Meetboard Chat
                </CalButton>

                {/* Google Meet */}
                <CalButton
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={createGoogleMeet}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Google Meet
                </CalButton>

                {/* Schedule Meeting */}
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => {
                    const eventTitle = encodeURIComponent(`${project.title} - Client Meeting`)
                    const eventDetails = encodeURIComponent(`Project discussion with ${project.freelancer.name}`)
                    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}`
                    window.open(calendarUrl, '_blank')
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>

                {/* Email Freelancer */}
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => {
                    const subject = encodeURIComponent(`${project.title} - Project Update`)
                    const body = encodeURIComponent(`Hi ${project.freelancer.name},\n\nI wanted to discuss the project progress...\n\nBest regards,\n${project.client.name}`)
                    window.open(`mailto:${project.freelancer.email}?subject=${subject}&body=${body}`, '_blank')
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Freelancer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Client Tools */}
        <div className="space-y-6">
          {/* Payment Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Tools
              </CardTitle>
              <CardDescription>
                Manage payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {/* Stripe Payment */}
              <CalButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  toast((t) => (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Stripe Payment</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Enter amount (USD)"
                        className="px-3 py-2 border border-[#E3DBCC] bg-[#F3F0E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#101010] text-[#101010]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = Number((e.target as HTMLInputElement).value)
                            if (amount && amount > 0) {
                              toast.dismiss(t.id)
                              createStripePayment(amount)
                            } else {
                              toast.error('Please enter a valid amount')
                            }
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <CalButton
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector('input[type="number"]') as HTMLInputElement
                            const amount = Number(input?.value)
                            if (amount && amount > 0) {
                              toast.dismiss(t.id)
                              createStripePayment(amount)
                            } else {
                              toast.error('Please enter a valid amount')
                            }
                          }}
                        >
                          Pay Now
                        </CalButton>
                        <CalButton
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.dismiss(t.id)}
                        >
                          Cancel
                        </CalButton>
                      </div>
                    </div>
                  ), {
                    duration: Infinity,
                    style: {
                      background: '#FDFCF8',
                      color: '#101010',
                      border: '1px solid #E3DBCC',
                      borderRadius: '12px',
                      padding: '16px',
                      minWidth: '300px',
                    },
                  })
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Stripe
              </CalButton>

              {/* PayPal Payment */}
              <CalButton
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => {
                  toast((t) => (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">PayPal Payment</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Enter amount (USD)"
                        className="px-3 py-2 border border-[#E3DBCC] bg-[#F3F0E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#101010] text-[#101010]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = Number((e.target as HTMLInputElement).value)
                            if (amount && amount > 0) {
                              toast.dismiss(t.id)
                              createPayPalPayment(amount)
                            } else {
                              toast.error('Please enter a valid amount')
                            }
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <CalButton
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const inputs = document.querySelectorAll('input[type="number"]')
                            const input = inputs[inputs.length - 1] as HTMLInputElement
                            const amount = Number(input?.value)
                            if (amount && amount > 0) {
                              toast.dismiss(t.id)
                              createPayPalPayment(amount)
                            } else {
                              toast.error('Please enter a valid amount')
                            }
                          }}
                        >
                          Pay Now
                        </CalButton>
                        <CalButton
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.dismiss(t.id)}
                        >
                          Cancel
                        </CalButton>
                      </div>
                    </div>
                  ), {
                    duration: Infinity,
                    style: {
                      background: '#FDFCF8',
                      color: '#101010',
                      border: '1px solid #E3DBCC',
                      borderRadius: '12px',
                      padding: '16px',
                      minWidth: '300px',
                    },
                  })
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Pay with PayPal
              </CalButton>

              {/* Invoice Management */}
              <CalButton
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push(`/projects/${projectId}/invoices`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </CalButton>
            </CardContent>
          </Card>

          {/* Project Management */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Settings className="h-5 w-5 text-purple-600" />
                Project Management
              </CardTitle>
              <CardDescription className="text-slate-600">
                Tools to manage your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {/* File Management */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/projects/${projectId}/files`)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Manage Files
              </Button>

              {/* Milestones */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/projects/${projectId}/milestones`)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                View Milestones
              </Button>

              {/* Project Settings */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/projects/${projectId}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Project Settings
              </Button>
            </CardContent>
          </Card>

          {/* External Integrations */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <ExternalLink className="h-5 w-5 text-orange-600" />
                External Tools
              </CardTitle>
              <CardDescription className="text-slate-600">
                Connect with external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {/* Slack Integration */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://slack.com', '_blank')}
              >
                <Slack className="h-4 w-4 mr-2" />
                Connect Slack
              </Button>

              {/* GitHub Integration */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="h-4 w-4 mr-2" />
                View GitHub
              </Button>

              {/* Figma Integration */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://figma.com', '_blank')}
              >
                <Figma className="h-4 w-4 mr-2" />
                Open Figma
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
