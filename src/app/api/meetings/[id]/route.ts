import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyMeetingConfirmed, notifyMeetingCancelled } from "@/lib/notifications"

// Get meeting details
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

    // Find the meeting
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

    return NextResponse.json({
      success: true,
      meeting
    })

  } catch (error) {
    console.error("Error fetching meeting:", error)
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    )
  }
}

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

    const { status } = await request.json()

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Find the meeting and verify user has permission to update it
    const meeting = await prisma.meeting.findUnique({
      where: { id }
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

    // Update the meeting
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { status },
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

    // Send notifications based on status change
    if (status === "CONFIRMED") {
      await notifyMeetingConfirmed(
        updatedMeeting.id,
        updatedMeeting.clientId,
        updatedMeeting.freelancerId
      )
    } else if (status === "CANCELLED") {
      // Notify the other party about cancellation
      const notifyUserId = session.user.id === updatedMeeting.clientId
        ? updatedMeeting.freelancerId
        : updatedMeeting.clientId

      const cancelledByName = session.user.id === updatedMeeting.clientId
        ? updatedMeeting.client.name || "Client"
        : updatedMeeting.freelancer.name || "Freelancer"

      await notifyMeetingCancelled(updatedMeeting.id, notifyUserId, cancelledByName)
    }

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error("Error updating meeting:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
