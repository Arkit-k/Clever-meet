import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Create a new project with milestones and escrow protection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Only clients can create projects" },
        { status: 401 }
      )
    }

    const {
      freelancerId,
      title,
      description,
      totalAmount,
      milestones,
      startDate,
      endDate
    } = await request.json()

    // Validate inputs
    if (!freelancerId || !title || !description || !totalAmount || !milestones || milestones.length === 0) {
      return NextResponse.json(
        { error: "Missing required project details" },
        { status: 400 }
      )
    }

    // Verify freelancer exists and is verified
    const freelancer = await prisma.user.findFirst({
      where: {
        id: freelancerId,
        role: "FREELANCER"
      },
      include: {
        verification: true
      }
    })

    if (!freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      )
    }

    // Check if freelancer is verified (optional but recommended)
    if (!freelancer.verification?.idVerification || freelancer.verification.idVerification !== 'VERIFIED') {
      console.warn(`⚠️ Creating project with unverified freelancer: ${freelancer.name}`)
    }

    // Validate milestone amounts add up to total
    const milestoneTotal = milestones.reduce((sum: number, m: any) => sum + m.amount, 0)
    if (Math.abs(milestoneTotal - totalAmount) > 0.01) {
      return NextResponse.json(
        { error: "Milestone amounts must equal total project amount" },
        { status: 400 }
      )
    }

    // Create project with milestones in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the project
      const project = await tx.project.create({
        data: {
          clientId: session.user.id,
          freelancerId,
          title,
          description,
          totalAmount,
          currency: "USD",
          status: "DRAFT",
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        }
      })

      // Create milestones
      const createdMilestones = await Promise.all(
        milestones.map((milestone: any, index: number) =>
          tx.milestone.create({
            data: {
              projectId: project.id,
              title: milestone.title,
              description: milestone.description,
              amount: milestone.amount,
              dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
              status: "PENDING"
            }
          })
        )
      )

      return { project, milestones: createdMilestones }
    })

    // Send notification to freelancer
    await prisma.notification.create({
      data: {
        userId: freelancerId,
        title: "New Project Proposal! 🎯",
        message: `${session.user.name} has proposed a project: "${title}" worth $${totalAmount}`,
        type: "project_proposal"
      }
    })

    console.log(`📋 Project created: "${title}" - $${totalAmount} with ${milestones.length} milestones`)

    return NextResponse.json({
      success: true,
      project: result.project,
      milestones: result.milestones,
      message: "Project created successfully! Freelancer will be notified to review and accept."
    })

  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
