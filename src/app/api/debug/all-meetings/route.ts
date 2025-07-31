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

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: "Debug endpoint only available in development" },
        { status: 403 }
      )
    }

    const meetings = await prisma.meeting.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`🔍 Debug: Found ${meetings.length} total meetings in database`)

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching all meetings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
