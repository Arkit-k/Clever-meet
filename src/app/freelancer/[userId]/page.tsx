"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalBookingButton } from "@/components/cal-embed"
import { VerificationBadge } from "@/components/verification-badge"
import { IntegrationShowcase } from "@/components/integration-showcase"
import { Star, DollarSign, Calendar, MapPin, Clock, Award } from "lucide-react"
import { useSession } from "next-auth/react"

interface FreelancerProfile {
  id: string
  userId: string
  title: string
  description: string
  hourlyRate: number
  skills: string[]
  experience: string
  portfolio: any[]
  integrations: any[]
  availability: string
  calLink: string
  isActive: boolean
  user: {
    name: string
    email: string
  }
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.userId) {
      fetchFreelancerProfile(params.userId as string)
    }
  }, [params.userId])

  const fetchFreelancerProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/freelancer/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setFreelancer(data.freelancer)
      }
    } catch (error) {
      console.error("Error fetching freelancer profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!freelancer) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Freelancer Not Found</h2>
            <p className="text-muted-foreground">The freelancer profile you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl">{freelancer.user.name}</CardTitle>
                <VerificationBadge profile={freelancer} size="lg" showText />
              </div>
              <CardDescription className="text-lg">{freelancer.title}</CardDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${freelancer.hourlyRate}/hour
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {freelancer.experience}
                </div>
              </div>
            </div>
            
            {session?.user.role === "CLIENT" && (
              <div className="space-y-2">
                {freelancer.calLink ? (
                  <CalBookingButton
                    calLink={freelancer.calLink}
                    buttonText="🔍 Book Discovery Meeting"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    config={{
                      name: session?.user.name || "",
                      email: session?.user.email || "",
                      notes: `Discovery meeting with ${session?.user.name} via Freelance MeetBoard`
                    }}
                  />
                ) : (
                  <Button disabled variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    No Booking Available
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{freelancer.description}</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {freelancer.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>
                  {freelancer.portfolio.length} project{freelancer.portfolio.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Integrations */}
          {freelancer.integrations.length > 0 && (
            <IntegrationShowcase 
              integrations={freelancer.integrations}
              freelancerName={freelancer.user.name}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              {freelancer.calLink ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Book a 15-minute discovery call to discuss your project
                  </p>
                  {session?.user.role === "CLIENT" && (
                    <CalBookingButton
                      calLink={freelancer.calLink}
                      buttonText="📅 Schedule Discovery Call"
                      className="w-full"
                      config={{
                        name: session?.user.name || "",
                        email: session?.user.email || "",
                        notes: `Discovery meeting with ${session?.user.name} via Freelance MeetBoard`
                      }}
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {freelancer.availability || "Contact for availability"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Skills</span>
                <span className="text-sm font-medium">{freelancer.skills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Portfolio Items</span>
                <span className="text-sm font-medium">{freelancer.portfolio.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Platforms</span>
                <span className="text-sm font-medium">{freelancer.integrations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span className="text-sm font-medium">{freelancer.experience}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {session?.user.role === "CLIENT" && (
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ready to work with {freelancer.user.name}?
                </p>
                <div className="space-y-2">
                  {freelancer.calLink ? (
                    <CalBookingButton
                      calLink={freelancer.calLink}
                      buttonText="Book Discovery Meeting"
                      className="w-full"
                      config={{
                        name: session?.user.name || "",
                        email: session?.user.email || "",
                        notes: `Discovery meeting with ${session?.user.name} via Freelance MeetBoard`
                      }}
                    />
                  ) : (
                    <Button className="w-full" disabled>
                      Contact Freelancer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
