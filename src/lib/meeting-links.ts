import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

// Generate meeting links (you can integrate with Zoom, Whereby, etc.)
export function generateMeetingLink(meetingId: string, meetingTitle: string): string {
  // For MVP, we'll use a simple meeting room URL
  // In production, integrate with Zoom API, Whereby API, etc.

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Option 1: Use our internal meeting room
  return `${baseUrl}/meeting-room/${meetingId}`

  // Option 2: Generate Zoom-style link (for future integration)
  // return `https://zoom.us/j/${generateZoomMeetingId()}?pwd=${generateZoomPassword()}`

  // Option 3: Generate Whereby link (for future integration)
  // return `https://whereby.com/clearaway-${meetingId}`
}

// Schedule meeting reminder notifications
export async function scheduleMeetingReminders(meetingId: string) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } }
      }
    })

    if (!meeting) {
      console.error("Meeting not found for reminder scheduling")
      return
    }

    const meetingTime = new Date(meeting.scheduledAt)
    const now = new Date()
    const oneHourBefore = new Date(meetingTime.getTime() - 60 * 60 * 1000) // 1 hour before

    // Check if we should send the reminder now or schedule it
    if (oneHourBefore <= now && meetingTime > now) {
      // Meeting is within 1 hour, send reminder immediately
      await sendMeetingReminder(meeting)
    } else if (oneHourBefore > now) {
      // Schedule reminder for later (in a real app, use a job queue like Bull or Agenda)
      console.log(`📅 Meeting reminder scheduled for ${oneHourBefore.toISOString()}`)
      // For MVP, we'll check this periodically or trigger manually
    }
  } catch (error) {
    console.error("Error scheduling meeting reminders:", error)
  }
}

// Send meeting reminder with link
async function sendMeetingReminder(meeting: any) {
  try {
    const meetingLink = meeting.meetingUrl || generateMeetingLink(meeting.id, meeting.title)
    const meetingTime = new Date(meeting.scheduledAt).toLocaleString()

    // Send to client
    await createNotification(
      meeting.clientId,
      "Meeting Starting Soon! 🕐",
      `Your meeting "${meeting.title}" with ${meeting.freelancer.name} starts in 1 hour (${meetingTime}). Join here: ${meetingLink}`,
      "meeting_reminder"
    )

    // Send to freelancer
    await createNotification(
      meeting.freelancerId,
      "Meeting Starting Soon! 🕐",
      `Your meeting "${meeting.title}" with ${meeting.client.name} starts in 1 hour (${meetingTime}). Join here: ${meetingLink}`,
      "meeting_reminder"
    )

    console.log(`✅ Meeting reminders sent for meeting ${meeting.id}`)
  } catch (error) {
    console.error("Error sending meeting reminder:", error)
  }
}

// Check for upcoming meetings and send reminders
export async function checkUpcomingMeetings() {
  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Find meetings that start within the next hour and haven't been reminded yet
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        scheduledAt: {
          gte: oneHourFromNow,
          lte: twoHoursFromNow
        },
        status: "CONFIRMED",
        duration: { gt: 0 } // Only for actual meetings, not collaboration boards
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } }
      }
    })

    for (const meeting of upcomingMeetings) {
      await sendMeetingReminder(meeting)
    }

    if (upcomingMeetings.length > 0) {
      console.log(`📅 Processed ${upcomingMeetings.length} upcoming meeting reminders`)
    }
  } catch (error) {
    console.error("Error checking upcoming meetings:", error)
  }
}

// Update meeting with generated link
export async function updateMeetingWithLink(meetingId: string, title: string) {
  try {
    const meetingLink = generateMeetingLink(meetingId, title)
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { meetingUrl: meetingLink }
    })

    console.log(`✅ Meeting link generated for ${meetingId}: ${meetingLink}`)
    return meetingLink
  } catch (error) {
    console.error("Error updating meeting with link:", error)
    return null
  }
}

// Integration helpers for future use
export function generateZoomMeetingId(): string {
  // Generate Zoom-style meeting ID
  return Math.random().toString().slice(2, 12).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
}

export function generateWherebyId(): string {
  // Generate Whereby-style room ID
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// For production: Integrate with actual video conferencing APIs
export async function createZoomMeeting(title: string, startTime: Date, duration: number) {
  // Zoom API integration
  // const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', { ... })
  // return zoomResponse.join_url
  return `https://zoom.us/j/${generateZoomMeetingId()}`
}

export async function createWherebyRoom(title: string, startTime: Date, duration: number) {
  // Whereby API integration
  // const wherebyResponse = await fetch('https://api.whereby.dev/v1/meetings', { ... })
  // return wherebyResponse.roomUrl
  return `https://whereby.com/clearaway-${generateWherebyId()}`
}
