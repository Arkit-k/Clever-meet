import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Build query based on user role
    const whereClause = session.user.role === "CLIENT" 
      ? { clientId: session.user.id }
      : { freelancerId: session.user.id }

    const projects = await prisma.project.findMany({
      where: whereClause,
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
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate additional metrics for each project
    const projectsWithMetrics = projects.map(project => {
      const completedMilestones = project.milestones.filter(m => m.status === 'APPROVED').length
      const totalMilestones = project.milestones.length
      const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
      
      const totalEarned = project.milestones
        .filter(m => m.status === 'APPROVED')
        .reduce((sum, m) => sum + m.amount, 0)

      const totalPaid = project.payments
        .filter(p => p.status === 'RELEASED')
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        ...project,
        metrics: {
          progress,
          completedMilestones,
          totalMilestones,
          totalEarned,
          totalPaid
        }
      }
    })

    return NextResponse.json({
      success: true,
      projects: projectsWithMetrics,
      count: projects.length
    })

  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
