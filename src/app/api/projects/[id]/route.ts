import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get individual project details
export async function GET(
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

    const projectId = params.id

    // Find the project and verify access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      },
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
        },
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            amount: true,
            status: true,
            dueDate: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            escrowedAt: true,
            releasedAt: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Calculate project metrics
    const completedMilestones = project.milestones.filter(m => m.status === 'APPROVED').length
    const totalMilestones = project.milestones.length
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
    
    const totalEarned = project.milestones
      .filter(m => m.status === 'APPROVED')
      .reduce((sum, m) => sum + m.amount, 0)

    const totalEscrowed = project.payments
      .filter(p => p.status === 'ESCROWED')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalReleased = project.payments
      .filter(p => p.status === 'RELEASED')
      .reduce((sum, p) => sum + p.amount, 0)

    const projectWithMetrics = {
      ...project,
      metrics: {
        progress,
        completedMilestones,
        totalMilestones,
        totalEarned,
        totalEscrowed,
        totalReleased
      }
    }

    return NextResponse.json({
      success: true,
      project: projectWithMetrics
    })

  } catch (error) {
    console.error("Error fetching project details:", error)
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    )
  }
}

// Update project status or details
export async function PATCH(
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

    const projectId = params.id
    const updates = await request.json()

    // Find the project and verify access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Only allow certain updates based on user role
    const allowedUpdates: any = {}

    if (session.user.role === "CLIENT") {
      // Clients can update project status (approve/reject)
      if (updates.status && ['CLIENT_APPROVED', 'CLIENT_REJECTED', 'CANCELLED'].includes(updates.status)) {
        allowedUpdates.status = updates.status
      }
    }

    if (session.user.role === "FREELANCER") {
      // Freelancers can accept projects
      if (updates.status && ['ACTIVE', 'COMPLETED'].includes(updates.status)) {
        allowedUpdates.status = updates.status
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      )
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: allowedUpdates,
      include: {
        client: { select: { name: true } },
        freelancer: { select: { name: true } }
      }
    })

    // Send notification based on status change
    if (allowedUpdates.status) {
      const otherPartyId = session.user.id === project.clientId ? project.freelancerId : project.clientId
      
      let notificationTitle = ""
      let notificationMessage = ""

      switch (allowedUpdates.status) {
        case 'CLIENT_APPROVED':
          notificationTitle = "🎉 Project Approved!"
          notificationMessage = `${session.user.name} approved the project. Meetboard is now accessible!`
          break
        case 'CLIENT_REJECTED':
          notificationTitle = "❌ Project Rejected"
          notificationMessage = `${session.user.name} rejected the project proposal.`
          break
        case 'ACTIVE':
          notificationTitle = "✅ Project Accepted"
          notificationMessage = `${session.user.name} accepted your project proposal.`
          break
        case 'COMPLETED':
          notificationTitle = "🏁 Project Completed"
          notificationMessage = `${session.user.name} marked the project as completed.`
          break
      }

      if (notificationTitle) {
        await prisma.notification.create({
          data: {
            userId: otherPartyId,
            title: notificationTitle,
            message: notificationMessage,
            type: "project_status"
          }
        })
      }
    }

    console.log(`📋 Project ${updatedProject.title} status updated to: ${allowedUpdates.status}`)

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: `Project status updated to ${allowedUpdates.status}`
    })

  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}
