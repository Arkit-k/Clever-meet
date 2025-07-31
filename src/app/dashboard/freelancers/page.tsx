"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Star, DollarSign, Users } from "lucide-react"
import { CalBookingButton } from "@/components/cal-embed"
import { VerificationBadge } from "@/components/verification-badge"
import { IntegrationBadges } from "@/components/integration-showcase"

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

export default function FreelancersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredFreelancers, setFilteredFreelancers] = useState<FreelancerProfile[]>([])

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
    
    fetchFreelancers()
  }, [session, status, router])

  useEffect(() => {
    // Filter freelancers based on search term
    const filtered = freelancers.filter(freelancer =>
      freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredFreelancers(filtered)
  }, [freelancers, searchTerm])

  const fetchFreelancers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/freelancers")
      if (response.ok) {
        const data = await response.json()
        setFreelancers(data.freelancers || [])
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookMeeting = (freelancerId: string) => {
    router.push(`/dashboard/book-meeting/${freelancerId}`)
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Find Freelancers</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skills, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {freelancer.user.name}
                    <VerificationBadge profile={freelancer} size="sm" />
                  </CardTitle>
                  <CardDescription>{freelancer.title}</CardDescription>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${freelancer.hourlyRate}/hr
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {freelancer.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {freelancer.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {freelancer.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{freelancer.skills.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Availability */}
              {freelancer.availability && (
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {freelancer.availability}
                </div>
              )}

              {/* Portfolio count */}
              {freelancer.portfolio.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {freelancer.portfolio.length} portfolio item{freelancer.portfolio.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Platform Integrations */}
              {freelancer.integrations && freelancer.integrations.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Platforms:</span>
                    <IntegrationBadges integrations={freelancer.integrations} maxShow={6} />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {freelancer.calLink ? (
                  <CalBookingButton
                    calLink={freelancer.calLink}
                    buttonText="🔍 Discovery Meeting (15min)"
                    className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    config={{
                      name: session?.user.name || "",
                      email: session?.user.email || "",
                      notes: `Discovery meeting with ${session?.user.name} via Cliverside - Free 15-minute consultation to discuss project fit`
                    }}
                  />
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    No Discovery Meeting Available
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/freelancer/${freelancer.userId}`)}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFreelancers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No freelancers found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "No freelancers have created profiles yet"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
