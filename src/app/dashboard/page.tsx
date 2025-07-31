"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalButton } from "@/components/ui/cal-button"
import { VerificationBadge } from "@/components/verification-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Star, Clock, TrendingUp, Bell } from "lucide-react"

interface DashboardStats {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
  totalEarnings?: number
  totalSpent?: number
  averageRating?: number
  activeFreelancers?: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0
  })
  const [recentMeetings, setRecentMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsResponse, meetingsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/meetings?limit=5")
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setRecentMeetings(meetingsData.meetings || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isFreelancer = session?.user.role === "FREELANCER"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}! Here's your overview.
        </p>
        {stats.totalMeetings === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">🎉 Welcome to Cliverside!</p>
            <p className="text-blue-700 text-sm mt-1">
              {isFreelancer
                ? "Complete your profile to start receiving meeting requests from clients."
                : "Start by browsing freelancers and booking your first discovery call."
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings}</div>
            <p className="text-xs text-muted-foreground">
              All time meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isFreelancer ? "Earnings" : "Spent"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isFreelancer ? stats.totalEarnings || 0 : stats.totalSpent || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total {isFreelancer ? "earned" : "spent"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isFreelancer ? "Rating" : "Freelancers"}
            </CardTitle>
            {isFreelancer ? (
              <Star className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isFreelancer 
                ? `${stats.averageRating || 0}/5` 
                : stats.activeFreelancers || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {isFreelancer ? "Average rating" : "Available freelancers"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isFreelancer ? (
              <>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Update Profile
                  </Button>
                </Link>
                <Link href="/dashboard/meetings">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    View Meetings
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    View Analytics
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/freelancers">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Find Freelancers
                  </Button>
                </Link>
                <Link href="/dashboard/meetings">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    My Meetings
                  </Button>
                </Link>
                <Link href="/dashboard/history">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    View History
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
          <CardDescription>Your latest meeting activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No recent meetings</p>
              {!isFreelancer && (
                <Link href="/dashboard/freelancers">
                  <Button className="mt-4">Book Your First Meeting</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentMeetings.slice(0, 3).map((meeting: any) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      with {isFreelancer ? meeting.client.name : meeting.freelancer.name}
                      {!isFreelancer && meeting.freelancer && (
                        <VerificationBadge profile={meeting.freelancer} size="sm" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    meeting.status === "CONFIRMED" ? "default" :
                    meeting.status === "PENDING" ? "secondary" :
                    meeting.status === "COMPLETED" ? "outline" : "destructive"
                  }>
                    {meeting.status}
                  </Badge>
                </div>
              ))}
              <Link href="/dashboard/meetings">
                <Button variant="outline" className="w-full">
                  View All Meetings
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Clients */}
      {!isFreelancer && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/freelancers">
                <Button className="w-full justify-start">
                  🔍 Browse Freelancers
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                <p className="font-medium mb-2">🚀 How Meeting Boards Work:</p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  <li>Book 15-min discovery call via Cal.com (external)</li>
                  <li>After call, go to freelancer's profile → "💭 Provide Feedback"</li>
                  <li>If you approve → Meeting Board opens automatically!</li>
                  <li>Meeting Board = collaboration workspace for your project</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Info</CardTitle>
            <CardDescription>Development debugging information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {session?.user.name} ({session?.user.role})</p>
              <p><strong>User ID:</strong> {session?.user.id}</p>
              <p><strong>Total Meetings:</strong> {stats.totalMeetings}</p>
              <p><strong>Upcoming Meetings:</strong> {stats.upcomingMeetings}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Data
                </Button>
                <Link href="/dashboard/notifications">
                  <Button size="sm" variant="outline">
                    Check Notifications
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
