import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyMeetingRequest } from "@/lib/notifications"
import { generateMeetingLink, scheduleMeetingReminders } from "@/lib/meeting-links"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const whereClause = session.user.role === "CLIENT"
      ? { clientId: session.user.id }
      : { freelancerId: session.user.id }

    console.log(`🔍 Fetching meetings for ${session.user.role}: ${session.user.name} (${session.user.id})`)
    console.log("🔍 Where clause:", whereClause)

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
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
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    console.log(`📅 Found ${meetings.length} meetings for user ${session.user.name}`)
    console.log("📅 Meetings:", meetings.map(m => ({ id: m.id, title: m.title, status: m.status })))

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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
      title,
      description,
      scheduledAt,
      duration
    } = await request.json()

    // Validate required fields
    if (!freelancerId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify freelancer exists
    const freelancer = await prisma.user.findFirst({
      where: {
        id: freelancerId,
        role: "FREELANCER"
      }
    })

    if (!freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      )
    }

    // Generate meeting link
    const meetingLink = generateMeetingLink(`temp-${Date.now()}`, title)

    const meeting = await prisma.meeting.create({
      data: {
        clientId: session.user.id,
        freelancerId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        status: "PENDING",
        meetingUrl: meetingLink
      },
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

    // Update meeting link with actual meeting ID
    const finalMeetingLink = generateMeetingLink(meeting.id, title)
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { meetingUrl: finalMeetingLink }
    })

    // Send notification to freelancer
    await notifyMeetingRequest(meeting.id, session.user.id, freelancerId)

    // Schedule meeting reminders
    await scheduleMeetingReminders(meeting.id)

    console.log(`✅ Meeting request created: ${meeting.id} from ${session.user.name} to freelancer ${freelancerId}`)
    console.log(`🔗 Meeting link: ${finalMeetingLink}`)

    return NextResponse.json({ meeting: { ...meeting, meetingUrl: finalMeetingLink } })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
