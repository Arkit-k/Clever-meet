import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        },
        freelancer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Check if user is involved in this meeting
    if (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error("Error fetching meeting details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
