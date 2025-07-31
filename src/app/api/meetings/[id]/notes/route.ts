import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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

    const { notes } = await request.json()

    // Verify user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    })

    if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { notes }
    })

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error("Error updating notes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
