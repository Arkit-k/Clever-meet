"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, DollarSign, Star, Users, Clock, Target } from "lucide-react"

interface AnalyticsData {
  totalEarnings: number
  monthlyEarnings: number
  totalMeetings: number
  monthlyMeetings: number
  averageRating: number
  totalReviews: number
  averageSessionDuration: number
  topClients: Array<{
    name: string
    meetingsCount: number
    totalSpent: number
  }>
  monthlyStats: Array<{
    month: string
    earnings: number
    meetings: number
  }>
  recentReviews: Array<{
    rating: number
    comment: string
    clientName: string
    createdAt: string
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("6months")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "FREELANCER") {
      router.push("/dashboard")
      return
    }
    
    fetchAnalytics()
  }, [session, status, router, timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!analytics) {
    return <div className="text-center py-12">Failed to load analytics data</div>
  }

  const earningsGrowth = analytics.monthlyStats.length >= 2 
    ? ((analytics.monthlyStats[analytics.monthlyStats.length - 1].earnings - 
        analytics.monthlyStats[analytics.monthlyStats.length - 2].earnings) / 
       analytics.monthlyStats[analytics.monthlyStats.length - 2].earnings) * 100
    : 0

  const meetingsGrowth = analytics.monthlyStats.length >= 2
    ? ((analytics.monthlyStats[analytics.monthlyStats.length - 1].meetings - 
        analytics.monthlyStats[analytics.monthlyStats.length - 2].meetings) / 
       analytics.monthlyStats[analytics.monthlyStats.length - 2].meetings) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <select
          className="p-2 border rounded-md"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalEarnings.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {earningsGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(earningsGrowth).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMeetings}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {meetingsGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(meetingsGrowth).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.totalReviews} review{analytics.totalReviews !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageSessionDuration}min</div>
            <p className="text-xs text-muted-foreground">
              Average meeting duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Your earnings and meeting trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{stat.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stat.meetings} meeting{stat.meetings !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${stat.earnings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(stat.earnings / (stat.meetings || 1)).toFixed(2)} avg per meeting
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Clients
            </CardTitle>
            <CardDescription>Your most valuable client relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topClients.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No client data yet</p>
              ) : (
                analytics.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.meetingsCount} meeting{client.meetingsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${client.totalSpent.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">total spent</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
            <CardDescription>Latest feedback from your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No reviews yet</p>
              ) : (
                analytics.recentReviews.map((review, index) => (
                  <div key={index} className="border-l-4 border-primary/20 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.clientName}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mb-2">"{review.comment}"</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${(analytics.monthlyEarnings / 30).toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Daily average this month</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalReviews > 0 ? 
                  `${((analytics.recentReviews.filter(r => r.rating >= 4).length / analytics.totalReviews) * 100).toFixed(0)}%`
                  : "0%"
                }
              </div>
              <p className="text-sm text-muted-foreground">4+ star reviews</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.topClients.length}
              </div>
              <p className="text-sm text-muted-foreground">Regular clients</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
