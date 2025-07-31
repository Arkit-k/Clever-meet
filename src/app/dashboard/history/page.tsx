"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, Star, Filter, Search } from "lucide-react"

interface HistoryMeeting {
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
  review?: {
    rating: number
    comment: string
  }
  payments: {
    amount: number
    status: string
  }[]
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<HistoryMeeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

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
    
    fetchHistory()
  }, [session, status, router])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/meetings/history")
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    // Search filter
    if (searchTerm && !meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !meeting.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (statusFilter !== "all" && meeting.status !== statusFilter) {
      return false
    }
    
    // Date range filter
    if (dateRange.start && new Date(meeting.scheduledAt) < new Date(dateRange.start)) {
      return false
    }
    if (dateRange.end && new Date(meeting.scheduledAt) > new Date(dateRange.end)) {
      return false
    }
    
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const totalSpent = filteredMeetings.reduce((sum, meeting) => {
    return sum + meeting.payments
      .filter(p => p.status === "COMPLETED")
      .reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
  }, 0)

  if (status === "loading" || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meeting History</h1>
        <div className="text-sm text-muted-foreground">
          Total spent: <span className="font-semibold">${totalSpent.toFixed(2)}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Total Meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredMeetings.filter(m => m.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredMeetings.filter(m => m.review).length}
            </div>
            <p className="text-xs text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredMeetings.filter(m => m.review).length > 0 
                ? (filteredMeetings
                    .filter(m => m.review)
                    .reduce((sum, m) => sum + (m.review?.rating || 0), 0) / 
                   filteredMeetings.filter(m => m.review).length).toFixed(1)
                : "0"
              }
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating Given</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search meetings or freelancers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full mt-1 p-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateRange.start || dateRange.end
                  ? "Try adjusting your filters"
                  : "You haven't had any meetings yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMeetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {meeting.title}
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {meeting.freelancer.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.scheduledAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.duration} minutes
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {meeting.payments.length > 0 && (
                      <div className="text-lg font-semibold">
                        ${meeting.payments
                          .filter(p => p.status === "COMPLETED")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(2)
                        }
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {meeting.description}
                  </p>
                )}

                {meeting.review && (
                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Your Review: {meeting.review.rating}/5</span>
                    </div>
                    {meeting.review.comment && (
                      <p className="text-sm text-muted-foreground">"{meeting.review.comment}"</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {meeting.status === "COMPLETED" && !meeting.review && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/meeting/${meeting.id}/review`)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Leave Review
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/meeting/${meeting.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
