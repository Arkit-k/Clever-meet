import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Create a dispute for project issues
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const {
      projectId,
      reason,
      description,
      evidence
    } = await request.json()

    // Validate inputs
    if (!projectId || !reason || !description) {
      return NextResponse.json(
        { error: "Missing required dispute information" },
        { status: 400 }
      )
    }

    // Verify user is part of the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Check if there's already an open dispute for this project
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        projectId,
        status: { in: ['OPEN', 'IN_REVIEW'] }
      }
    })

    if (existingDispute) {
      return NextResponse.json(
        { error: "There is already an open dispute for this project" },
        { status: 400 }
      )
    }

    // Create the dispute
    const dispute = await prisma.dispute.create({
      data: {
        projectId,
        raisedBy: session.user.id,
        reason,
        description,
        evidence: evidence ? JSON.stringify(evidence) : null,
        status: 'OPEN'
      }
    })

    // Update project status to disputed
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DISPUTED' }
    })

    // Notify the other party
    const otherPartyId = session.user.id === project.clientId ? project.freelancerId : project.clientId
    const otherPartyName = session.user.id === project.clientId ? project.freelancer.name : project.client.name

    await prisma.notification.create({
      data: {
        userId: otherPartyId,
        title: "⚠️ Dispute Raised",
        message: `A dispute has been raised for project "${project.title}". Our team will review and mediate.`,
        type: "dispute_created"
      }
    })

    // Notify admin/support team
    console.log(`🚨 DISPUTE CREATED: Project ${project.title} - Reason: ${reason}`)
    
    // In real implementation, send email to support team
    // await sendDisputeNotificationToSupport(dispute, project)

    return NextResponse.json({
      success: true,
      dispute,
      message: "Dispute created successfully. Our mediation team will review within 24 hours."
    })

  } catch (error) {
    console.error("Error creating dispute:", error)
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    )
  }
}

// Get disputes for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get all disputes where user is involved
    const disputes = await prisma.dispute.findMany({
      where: {
        project: {
          OR: [
            { clientId: session.user.id },
            { freelancerId: session.user.id }
          ]
        }
      },
      include: {
        project: {
          select: {
            title: true,
            client: { select: { name: true } },
            freelancer: { select: { name: true } }
          }
        },
        raiser: {
          select: { name: true, role: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      disputes
    })

  } catch (error) {
    console.error("Error fetching disputes:", error)
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    )
  }
}
