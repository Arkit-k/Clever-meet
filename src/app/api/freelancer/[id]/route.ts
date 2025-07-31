import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const freelancer = await prisma.freelancerProfile.findFirst({
      where: {
        userId: params.id,
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

    // Parse JSON fields
    const formattedFreelancer = {
      ...freelancer,
      skills: JSON.parse(freelancer.skills || "[]"),
      portfolio: JSON.parse(freelancer.portfolio || "[]")
    }

    return NextResponse.json({ freelancer: formattedFreelancer })
  } catch (error) {
    console.error("Error fetching freelancer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
