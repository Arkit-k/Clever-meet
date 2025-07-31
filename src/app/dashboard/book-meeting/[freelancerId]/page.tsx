"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User } from "lucide-react"
import toast from 'react-hot-toast'

interface FreelancerProfile {
  id: string
  userId: string
  title: string
  description: string
  hourlyRate: number
  availability: string
  user: {
    name: string
    email: string
  }
}

export default function BookMeetingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const freelancerId = params.freelancerId as string

  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60
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
      const response = await fetch(`/api/freelancer/${freelancerId}`)
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

  const handleBookMeeting = async () => {
    if (!meetingData.title || !meetingData.scheduledAt) {
      toast.error("❌ Please fill in all required fields", {
        duration: 4000,
      })
      return
    }

    setIsBooking(true)
    try {
      console.log("📅 Booking meeting with data:", {
        freelancerId,
        title: meetingData.title,
        description: meetingData.description,
        scheduledAt: new Date(meetingData.scheduledAt).toISOString(),
        duration: meetingData.duration
      })

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerId,
          title: meetingData.title,
          description: meetingData.description,
          scheduledAt: new Date(meetingData.scheduledAt).toISOString(),
          duration: meetingData.duration
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("🎉 Meeting request sent successfully! The freelancer will be notified.", {
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
      } else {
        toast.error(`❌ ${data.error || "Failed to book meeting"}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error("❌ An error occurred while booking the meeting", {
        duration: 5000,
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!freelancer) {
    return <div className="text-center py-12">Freelancer not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Book a Meeting</h1>
      </div>

      {/* Freelancer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {freelancer.user.name}
          </CardTitle>
          <CardDescription>{freelancer.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {freelancer.description}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Rate: ${freelancer.hourlyRate}/hr
            </div>
            {freelancer.availability && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {freelancer.availability}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Traditional Meeting Request</CardTitle>
          <CardDescription>
            Request a formal meeting (Alternative to quick discovery calls via Cal.com)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Recommended: Use Discovery Calls Instead</h4>
            <p className="text-sm text-yellow-700">
              For faster results, book a 15-minute discovery call via Cal.com on their profile.
              This form is for traditional meeting requests that require freelancer approval.
            </p>
          </div>

          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Project Discussion, Initial Consultation"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you'd like to discuss in this meeting..."
              value={meetingData.description}
              onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledAt">Preferred Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={meetingData.scheduledAt}
                onChange={(e) => setMeetingData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="240"
                step="15"
                value={meetingData.duration}
                onChange={(e) => setMeetingData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• This is a meeting request that requires freelancer approval</li>
              <li>• You'll receive a notification once the freelancer responds</li>
              <li>• Meeting details can be discussed and adjusted if needed</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleBookMeeting} 
              disabled={isBooking}
              className="flex-1"
            >
              {isBooking ? "Sending Request..." : "Send Meeting Request"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
