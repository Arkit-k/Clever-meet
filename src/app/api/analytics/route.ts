import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "6months"
    
    // Calculate date range
    const now = new Date()
    const monthsBack = range === "3months" ? 3 : range === "1year" ? 12 : 6
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

    const freelancerId = session.user.id

    // Get total earnings
    const totalEarnings = await prisma.payment.aggregate({
      where: {
        freelancerId,
        status: "COMPLETED"
      },
      _sum: { amount: true }
    })

    // Get monthly earnings
    const monthlyEarnings = await prisma.payment.aggregate({
      where: {
        freelancerId,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    // Get total meetings
    const totalMeetings = await prisma.meeting.count({
      where: { freelancerId }
    })

    // Get monthly meetings
    const monthlyMeetings = await prisma.meeting.count({
      where: {
        freelancerId,
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      }
    })

    // Get average rating and total reviews
    const reviews = await prisma.review.aggregate({
      where: { revieweeId: freelancerId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    // Get average session duration
    const meetings = await prisma.meeting.findMany({
      where: { 
        freelancerId,
        status: "COMPLETED"
      },
      select: { duration: true }
    })
    
    const averageSessionDuration = meetings.length > 0 
      ? Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / meetings.length)
      : 0

    // Get top clients
    const topClients = await prisma.meeting.groupBy({
      by: ['clientId'],
      where: { freelancerId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    const topClientsWithDetails = await Promise.all(
      topClients.map(async (client) => {
        const user = await prisma.user.findUnique({
          where: { id: client.clientId },
          select: { name: true }
        })
        
        const totalSpent = await prisma.payment.aggregate({
          where: {
            clientId: client.clientId,
            freelancerId,
            status: "COMPLETED"
          },
          _sum: { amount: true }
        })

        return {
          name: user?.name || "Unknown",
          meetingsCount: client._count.id,
          totalSpent: totalSpent._sum.amount || 0
        }
      })
    )

    // Get monthly stats
    const monthlyStats = []
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [monthEarnings, monthMeetingsCount] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            freelancerId,
            status: "COMPLETED",
            createdAt: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        prisma.meeting.count({
          where: {
            freelancerId,
            createdAt: { gte: monthStart, lte: monthEnd }
          }
        })
      ])

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: monthEarnings._sum.amount || 0,
        meetings: monthMeetingsCount
      })
    }

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: { revieweeId: freelancerId },
      include: {
        reviewer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const analytics = {
      totalEarnings: totalEarnings._sum.amount || 0,
      monthlyEarnings: monthlyEarnings._sum.amount || 0,
      totalMeetings,
      monthlyMeetings,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count.rating,
      averageSessionDuration,
      topClients: topClientsWithDetails,
      monthlyStats,
      recentReviews: recentReviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        clientName: review.reviewer.name || "Anonymous",
        createdAt: review.createdAt.toISOString()
      }))
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
