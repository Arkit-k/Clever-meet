import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isFreelancer = session.user.role === "FREELANCER"
    const userId = session.user.id

    if (isFreelancer) {
      // Freelancer stats
      const [totalMeetings, upcomingMeetings, completedMeetings, payments, reviews] = await Promise.all([
        prisma.meeting.count({
          where: { freelancerId: userId }
        }),
        prisma.meeting.count({
          where: { 
            freelancerId: userId,
            status: { in: ["PENDING", "CONFIRMED"] },
            scheduledAt: { gte: new Date() }
          }
        }),
        prisma.meeting.count({
          where: { 
            freelancerId: userId,
            status: "COMPLETED"
          }
        }),
        prisma.payment.aggregate({
          where: { 
            freelancerId: userId,
            status: "COMPLETED"
          },
          _sum: { amount: true }
        }),
        prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { rating: true },
          _count: { rating: true }
        })
      ])

      const stats = {
        totalMeetings,
        upcomingMeetings,
        completedMeetings,
        totalEarnings: payments._sum.amount || 0,
        averageRating: reviews._avg.rating ? Math.round(reviews._avg.rating * 10) / 10 : 0,
        totalReviews: reviews._count.rating
      }

      return NextResponse.json({ stats })
    } else {
      // Client stats
      const [totalMeetings, upcomingMeetings, completedMeetings, payments, activeFreelancers] = await Promise.all([
        prisma.meeting.count({
          where: { clientId: userId }
        }),
        prisma.meeting.count({
          where: { 
            clientId: userId,
            status: { in: ["PENDING", "CONFIRMED"] },
            scheduledAt: { gte: new Date() }
          }
        }),
        prisma.meeting.count({
          where: { 
            clientId: userId,
            status: "COMPLETED"
          }
        }),
        prisma.payment.aggregate({
          where: { 
            clientId: userId,
            status: "COMPLETED"
          },
          _sum: { amount: true }
        }),
        prisma.freelancerProfile.count({
          where: { isActive: true }
        })
      ])

      const stats = {
        totalMeetings,
        upcomingMeetings,
        completedMeetings,
        totalSpent: payments._sum.amount || 0,
        activeFreelancers
      }

      return NextResponse.json({ stats })
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
