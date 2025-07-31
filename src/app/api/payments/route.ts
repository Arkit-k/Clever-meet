import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isFreelancer = session.user.role === "FREELANCER"
    const whereClause = isFreelancer 
      ? { freelancerId: session.user.id }
      : { clientId: session.user.id }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        meeting: {
          select: {
            title: true,
            scheduledAt: true
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      meetingId,
      amount,
      description
    } = await request.json()

    // Validate required fields
    if (!meetingId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
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

    const payment = await prisma.payment.create({
      data: {
        meetingId,
        clientId: meeting.clientId,
        freelancerId: meeting.freelancerId,
        amount,
        description,
        status: "PENDING"
      },
      include: {
        meeting: {
          select: {
            title: true,
            scheduledAt: true
          }
        },
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

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
