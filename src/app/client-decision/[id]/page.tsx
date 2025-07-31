"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, User, Calendar, Clock, MessageSquare } from "lucide-react"
import toast from 'react-hot-toast'

interface Meeting {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: string
  freelancer: {
    name: string
    email: string
  }
  client: {
    name: string
    email: string
  }
}

export default function ClientDecisionPage() {
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/details`)
      if (response.ok) {
        const data = await response.json()
        setMeeting(data.meeting)
      } else {
        console.error("Failed to fetch meeting")
      }
    } catch (error) {
      console.error("Error fetching meeting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecision = async (decision: 'approve' | 'reject') => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/client-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          feedback: feedback.trim() || null
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (decision === 'approve') {
          // Show success message and redirect to projects
          toast.success("🎉 Freelancer approved! Project created with meetboard access.", {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
            },
          })
          setTimeout(() => {
            router.push("/dashboard/projects")
          }, 2000)
        } else {
          // Show rejection confirmation and redirect to find new freelancer
          toast.success("✅ Feedback submitted. You can find a new freelancer from the dashboard.", {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
            },
          })
          setTimeout(() => {
            router.push("/dashboard/freelancers")
          }, 2000)
        }
      } else {
        toast.error("❌ Failed to submit decision. Please try again.", {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error("❌ An error occurred. Please try again.", {
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading meeting details...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Meeting Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The meeting you're looking for doesn't exist or has expired.
            </p>
            <Button onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">How was your meeting?</CardTitle>
            <CardDescription>
              Please let us know if you'd like to continue working with this freelancer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meeting Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Meeting Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Freelancer: <strong>{meeting.freelancer.name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(meeting.scheduledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{meeting.duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional feedback (optional)
              </label>
              <Textarea
                placeholder="Share your thoughts about the meeting..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleDecision('approve')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white py-6"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {isSubmitting ? "Processing..." : "Approve & Continue"}
              </Button>
              
              <Button
                onClick={() => handleDecision('reject')}
                disabled={isSubmitting}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 py-6"
                size="lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {isSubmitting ? "Processing..." : "Not Interested"}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>
                <strong>Approve:</strong> Create project and access meetboard for ongoing collaboration<br />
                <strong>Not Interested:</strong> End the meeting process
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
