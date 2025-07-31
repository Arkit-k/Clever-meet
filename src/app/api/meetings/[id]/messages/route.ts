import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Verify user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    })

    if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { meetingId: id },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    // Verify user has access to this meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    })

    if (!meeting || (meeting.clientId !== session.user.id && meeting.freelancerId !== session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        meetingId: id,
        senderId: session.user.id,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
