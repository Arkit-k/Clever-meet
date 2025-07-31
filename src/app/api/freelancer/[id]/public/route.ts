import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const freelancer = await prisma.freelancerProfile.findFirst({
      where: {
        userId: id,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      )
    }

    // Get reviews for this freelancer
    const reviews = await prisma.review.findMany({
      where: { revieweeId: id },
      include: {
        reviewer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Parse JSON fields and format response
    const formattedFreelancer = {
      ...freelancer,
      skills: JSON.parse(freelancer.skills || "[]"),
      portfolio: JSON.parse(freelancer.portfolio || "[]"),
      reviews,
      averageRating,
      totalReviews: reviews.length
    }

    return NextResponse.json({ freelancer: formattedFreelancer })
  } catch (error) {
    console.error("Error fetching public freelancer profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
