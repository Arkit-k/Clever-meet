"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Star, User, DollarSign } from "lucide-react"

interface FreelancerProfile {
  id: string
  userId: string
  title: string
  description: string
  hourlyRate: number
  skills: string[]
  user: {
    name: string
    email: string
  }
}

export default function ApproveFreelancerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const freelancerId = params.freelancerId as string

  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)
  const [feedback, setFeedback] = useState("")
  const [projectDetails, setProjectDetails] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: ""
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "CLIENT") {
      router.push("/dashboard")
      return
    }
    
    fetchFreelancer()
  }, [session, status, router, freelancerId])

  const fetchFreelancer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/freelancer/${freelancerId}/public`)
      if (response.ok) {
        const data = await response.json()
        setFreelancer(data.freelancer)
      } else {
        router.push("/dashboard/freelancers")
      }
    } catch (error) {
      console.error("Error fetching freelancer:", error)
      router.push("/dashboard/freelancers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!decision) {
      alert("Please make a decision first")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/freelancer-decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerId,
          decision,
          feedback,
          projectDetails: decision === "approve" ? projectDetails : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (decision === "approve") {
          alert("Great! Opening your Meeting Board with this freelancer...")
          // Redirect to the meeting board that was automatically created
          router.push(`/meeting/${data.meetingId}`)
        } else {
          alert("Thank you for your feedback. You can continue browsing other freelancers.")
          router.push("/dashboard/freelancers")
        }
      } else {
        alert("Failed to submit decision")
      }
    } catch (error) {
      console.error("Error submitting decision:", error)
      alert("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!freelancer) {
    return <div className="text-center py-12">Freelancer not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Post-Meeting Decision</h1>
      </div>

      {/* Freelancer Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{freelancer.user.name}</CardTitle>
              <CardDescription>{freelancer.title}</CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">${freelancer.hourlyRate}/hr</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Section */}
      <Card>
        <CardHeader>
          <CardTitle>How was your discovery call?</CardTitle>
          <CardDescription>
            Based on your 15-minute call, would you like to work with {freelancer.user.name}?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Buttons */}
          <div className="flex gap-4">
            <Button
              variant={decision === "approve" ? "default" : "outline"}
              className="flex-1 h-20 flex-col"
              onClick={() => setDecision("approve")}
            >
              <CheckCircle className="h-6 w-6 mb-2" />
              Yes, I want to work with them
            </Button>
            <Button
              variant={decision === "reject" ? "destructive" : "outline"}
              className="flex-1 h-20 flex-col"
              onClick={() => setDecision("reject")}
            >
              <XCircle className="h-6 w-6 mb-2" />
              No, not a good fit
            </Button>
          </div>

          {/* Feedback */}
          <div>
            <Label htmlFor="feedback">
              Feedback {decision === "approve" ? "(Optional)" : "(Required)"}
            </Label>
            <Textarea
              id="feedback"
              placeholder={
                decision === "approve" 
                  ? "What did you like about the call? (optional)"
                  : "What didn't work out? This helps us improve matches."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          {/* Project Details (if approved) */}
          {decision === "approve" && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    placeholder="e.g., E-commerce Website Development"
                    value={projectDetails.title}
                    onChange={(e) => setProjectDetails(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $2,000 - $5,000"
                    value={projectDetails.budget}
                    onChange={(e) => setProjectDetails(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe your project requirements..."
                  value={projectDetails.description}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., 4-6 weeks"
                  value={projectDetails.timeline}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, timeline: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !decision || (decision === "reject" && !feedback.trim())}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." :
             decision === "approve" ? "✅ Approve & Open Meeting Board" :
             decision === "reject" ? "❌ Reject & Submit Feedback" : "Make a Decision First"}
          </Button>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {decision && (
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            {decision === "approve" ? (
              <div className="space-y-2 text-sm">
                <p>🚀 <strong>Meeting Board will open immediately</strong> for collaboration</p>
                <p>💬 Chat with {freelancer.user.name} in real-time</p>
                <p>📁 Share files and project resources</p>
                <p>📝 Take notes and track progress together</p>
                <p>⭐ Leave a review after project completion</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>📝 Your feedback helps us improve our matching system</p>
                <p>🔍 You can continue browsing other freelancers</p>
                <p>📞 Book more discovery calls to find the right fit</p>
                <p>🔄 Both you and the freelancer can move on to new opportunities</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
