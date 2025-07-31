import { NextRequest, NextResponse } from "next/server"
import { checkUpcomingMeetings } from "@/lib/meeting-links"
import { sendMeetingReminder, scheduleUpcomingReminders } from "@/lib/meeting-reminders"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// API endpoint to manually trigger meeting reminder checks
// In production, this would be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { meetingId, action } = await request.json()

    if (action === "send_now" && meetingId) {
      // Send immediate reminder for specific meeting
      const success = await sendMeetingReminder(meetingId)

      return NextResponse.json({
        success,
        message: success ? "Reminder sent successfully" : "Failed to send reminder"
      })
    }

    if (action === "schedule_all") {
      // Schedule reminders for all upcoming meetings
      const scheduled = await scheduleUpcomingReminders()

      return NextResponse.json({
        success: true,
        message: `Scheduled reminders for ${scheduled} meetings`
      })
    }

    // Default: Check for upcoming meetings and send reminders
    await checkUpcomingMeetings()

    return NextResponse.json({
      success: true,
      message: "Meeting reminders checked and sent"
    })
  } catch (error) {
    console.error("Error checking meeting reminders:", error)
    return NextResponse.json(
      { error: "Failed to check meeting reminders" },
      { status: 500 }
    )
  }
}

// GET endpoint to check upcoming meetings without sending reminders
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma")
    
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        scheduledAt: {
          gte: oneHourFromNow,
          lte: twoHoursFromNow
        },
        status: "CONFIRMED",
        duration: { gt: 0 }
      },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      }
    })

    return NextResponse.json({ 
      upcomingMeetings,
      count: upcomingMeetings.length 
    })
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming meetings" },
      { status: 500 }
    )
  }
}
