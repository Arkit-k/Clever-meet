import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      freelancerId,
      decision,
      feedback,
      projectDetails
    } = await request.json()

    // Validate required fields
    if (!freelancerId || !decision || !["approve", "reject"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    if (decision === "reject" && !feedback?.trim()) {
      return NextResponse.json(
        { error: "Feedback is required for rejection" },
        { status: 400 }
      )
    }

    // Create or update freelancer decision record
    const decisionRecord = await prisma.freelancerDecision.upsert({
      where: {
        clientId_freelancerId: {
          clientId: session.user.id,
          freelancerId: freelancerId
        }
      },
      update: {
        decision,
        feedback,
        projectDetails: projectDetails ? JSON.stringify(projectDetails) : null,
        updatedAt: new Date()
      },
      create: {
        clientId: session.user.id,
        freelancerId: freelancerId,
        decision,
        feedback,
        projectDetails: projectDetails ? JSON.stringify(projectDetails) : null
      }
    })

    // Send notification to freelancer
    const client = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    })

    let meetingId = null

    if (decision === "approve") {
      // Automatically create a Meeting Board for the approved collaboration
      const meeting = await prisma.meeting.create({
        data: {
          clientId: session.user.id,
          freelancerId: freelancerId,
          title: projectDetails?.title || "Project Collaboration",
          description: projectDetails?.description || "Collaboration workspace after successful discovery call",
          scheduledAt: new Date(), // Start immediately
          duration: 0, // Ongoing collaboration, not a timed meeting
          status: "CONFIRMED", // Auto-confirmed since both parties agreed
          notes: `Budget: ${projectDetails?.budget || "TBD"}\nTimeline: ${projectDetails?.timeline || "TBD"}`
        }
      })

      meetingId = meeting.id

      await createNotification(
        freelancerId,
        "Client Approved You! 🎉",
        `${client?.name || "A client"} wants to work with you! Your Meeting Board is ready for collaboration.`,
        "client_approval"
      )

      // Also notify client
      await createNotification(
        session.user.id,
        "Meeting Board Ready! 🚀",
        `Your Meeting Board with the freelancer is ready. Start collaborating now!`,
        "meeting_board_ready"
      )
    } else {
      await createNotification(
        freelancerId,
        "Discovery Call Feedback",
        `${client?.name || "A client"} provided feedback from your discovery call.`,
        "client_feedback"
      )
    }

    console.log(`✅ Client decision recorded: ${decision} for freelancer ${freelancerId}`)

    return NextResponse.json({
      success: true,
      decision: decisionRecord,
      meetingId: meetingId,
      message: decision === "approve"
        ? "Freelancer approved! Opening your Meeting Board..."
        : "Thank you for your feedback."
    })
  } catch (error) {
    console.error("Error recording freelancer decision:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
