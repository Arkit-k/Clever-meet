import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get messages for a project meetboard
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

    // Verify user has access to this project
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

    // Check if project is approved for meetboard access
    if (project.status !== 'CLIENT_APPROVED') {
      return NextResponse.json(
        { error: "Meetboard access requires client approval" },
        { status: 403 }
      )
    }

    // Get messages for this project
    const messages = await prisma.message.findMany({
      where: {
        projectId: projectId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      createdAt: message.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages
    })

  } catch (error) {
    console.error("Error fetching project messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// Send a message in project meetboard
export async function POST(
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
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    // Verify user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Check if project is approved for meetboard access
    if (project.status !== 'CLIENT_APPROVED') {
      return NextResponse.json(
        { error: "Meetboard access requires client approval" },
        { status: 403 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        projectId: projectId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Send notification to the other party
    const otherPartyId = session.user.id === project.clientId ? project.freelancerId : project.clientId
    const otherPartyName = session.user.id === project.clientId ? project.freelancer.name : project.client.name

    await prisma.notification.create({
      data: {
        userId: otherPartyId,
        title: "New Project Message 💬",
        message: `${session.user.name} sent a message in project: ${project.title}`,
        type: "project_message"
      }
    })

    console.log(`💬 Project message sent in ${project.title} by ${session.user.name}`)

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        createdAt: message.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error("Error sending project message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
