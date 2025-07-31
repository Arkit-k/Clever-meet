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

    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse JSON fields for each freelancer
    const formattedFreelancers = freelancers.map(freelancer => ({
      ...freelancer,
      skills: JSON.parse(freelancer.skills || "[]"),
      portfolio: JSON.parse(freelancer.portfolio || "[]"),
      integrations: JSON.parse(freelancer.integrations || "[]")
    }))

    return NextResponse.json({ freelancers: formattedFreelancers })
  } catch (error) {
    console.error("Error fetching freelancers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
