import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Complete discovery meeting and trigger client decision
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const meetingId = params.id

    // Get the meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        client: true,
        freelancer: true
      }
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Verify this is a discovery meeting
    if (meeting.type !== 'DISCOVERY') {
      return NextResponse.json(
        { error: "This endpoint is only for discovery meetings" },
        { status: 400 }
      )
    }

    // Verify user is part of this meeting
    if (session.user.id !== meeting.clientId && session.user.id !== meeting.freelancerId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Check if meeting time has passed (allow completion 5 minutes before end)
    const now = new Date()
    const meetingEnd = new Date(meeting.scheduledAt.getTime() + (meeting.duration - 5) * 60 * 1000)
    
    if (now < meetingEnd) {
      return NextResponse.json(
        { error: "Meeting cannot be completed yet" },
        { status: 400 }
      )
    }

    // Update meeting status to await client decision
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'AWAITING_CLIENT_DECISION',
        clientDecision: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: "Discovery meeting completed. Client decision required.",
      redirectUrl: session.user.role === 'CLIENT' 
        ? `/client-decision/${meetingId}` 
        : `/dashboard/meetings`
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete discovery meeting" },
      { status: 500 }
    )
  }
}
