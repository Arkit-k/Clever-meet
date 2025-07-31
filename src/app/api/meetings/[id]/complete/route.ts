import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// API endpoint to mark a meeting as completed and trigger client decision flow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id

    // Find the meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } }
      }
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Check if meeting is confirmed (ready to be completed)
    if (meeting.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Meeting must be confirmed before it can be completed" },
        { status: 400 }
      )
    }

    // Update meeting status to trigger client decision flow
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "AWAITING_CLIENT_DECISION"
      }
    })

    console.log(`🎯 Meeting ${meetingId} completed - Awaiting client decision`)

    // TODO: Send notification to client with decision link
    // const clientDecisionUrl = `${process.env.NEXTAUTH_URL}/client-decision/${meetingId}`
    // await notifyClientForDecision(meeting.client.id, clientDecisionUrl)

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      clientDecisionUrl: `/client-decision/${meetingId}`,
      message: "Meeting completed. Client decision required."
    })

  } catch (error) {
    console.error("Error completing meeting:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Auto-complete meetings that have passed their scheduled end time
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Check if meeting should be auto-completed
    const meetingEndTime = new Date(meeting.scheduledAt.getTime() + meeting.duration * 60000)
    const now = new Date()

    if (now > meetingEndTime && meeting.status === "CONFIRMED") {
      // Auto-complete the meeting
      const updatedMeeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "AWAITING_CLIENT_DECISION"
        }
      })

      return NextResponse.json({
        autoCompleted: true,
        meeting: updatedMeeting,
        clientDecisionUrl: `/client-decision/${meetingId}`
      })
    }

    return NextResponse.json({
      autoCompleted: false,
      meeting,
      timeRemaining: meetingEndTime.getTime() - now.getTime()
    })

  } catch (error) {
    console.error("Error checking meeting completion:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
