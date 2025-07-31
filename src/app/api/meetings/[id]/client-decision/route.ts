import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id
    const { decision, feedback } = await request.json()

    // Validate decision (support both formats)
    const normalizedDecision = decision?.toLowerCase()
    if (!normalizedDecision || !['approve', 'reject', 'approved', 'rejected'].includes(normalizedDecision)) {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    const isApproved = ['approve', 'approved'].includes(normalizedDecision)

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

    // Check if meeting is in the right status for client decision
    if (meeting.status !== "AWAITING_CLIENT_DECISION" && meeting.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Meeting is not ready for client decision" },
        { status: 400 }
      )
    }

    // Update meeting status based on decision
    const newStatus = isApproved ? 'CLIENT_APPROVED' : 'CLIENT_REJECTED'

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: newStatus,
        clientDecision: isApproved ? 'APPROVED' : 'REJECTED',
        notes: feedback ? `${meeting.notes || ''}\n\nClient Feedback: ${feedback}` : meeting.notes
      }
    })

    // If approved, create a project and enable meetboard access
    if (isApproved) {
      // Create a project for ongoing collaboration
      const project = await prisma.project.create({
        data: {
          clientId: meeting.clientId,
          freelancerId: meeting.freelancerId,
          title: `${meeting.title} - Project`,
          description: `Project created after successful 15-minute meeting.\n\nOriginal meeting: ${meeting.description || ''}`,
          totalAmount: 0, // Will be set when client creates milestones
          status: 'CLIENT_APPROVED', // Directly approved for meetboard access
          startDate: new Date()
        }
      })

      // Update meeting to reference the created project
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          duration: 0,
          title: `${meeting.title} - Approved`,
          description: `${meeting.description || ''}\n\nClient approved collaboration. Project created: ${project.id}`
        }
      })

      console.log(`✅ Client approved freelancer ${meeting.freelancer.name} - Project created with meetboard access`)
    } else {
      console.log(`❌ Client rejected freelancer ${meeting.freelancer.name}`)
    }

    // TODO: Send notifications to freelancer about client decision
    // await notifyFreelancerOfClientDecision(meeting.freelancer.id, decision, feedback)

    return NextResponse.json({
      success: true,
      decision: isApproved ? 'approved' : 'rejected',
      meeting: updatedMeeting,
      message: isApproved
        ? "Freelancer approved! Redirecting to collaboration workspace..."
        : "Thank you for your feedback. You can find a new freelancer from the dashboard.",
      redirectUrl: isApproved
        ? `/dashboard/projects`
        : `/dashboard/freelancers`
    })

  } catch (error) {
    console.error("Error processing client decision:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
