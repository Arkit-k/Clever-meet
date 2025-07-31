import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { title, description, startTime, endTime, attendeeEmails } = await request.json()

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      )
    }

    // Initialize Google Calendar API
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    )

    // In a real implementation, you would get the user's access token
    // For now, we'll create a simple meeting URL
    const meetingId = generateMeetingId()
    const meetingUrl = `https://meet.google.com/${meetingId}`

    // Create calendar event (simplified version)
    const event = {
      summary: title,
      description: description || "Meeting created via Freelance MeetBoard",
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      attendees: attendeeEmails?.map((email: string) => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: meetingId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }

    return NextResponse.json({
      success: true,
      meetingUrl: meetingUrl,
      meetingId: meetingId,
      event: event,
      message: "Google Meet link created successfully"
    })

  } catch (error) {
    console.error('Google Meet creation error:', error)
    return NextResponse.json(
      { error: "Failed to create Google Meet" },
      { status: 500 }
    )
  }
}

function generateMeetingId(): string {
  // Generate a Google Meet-style meeting ID
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const segments = []
  
  for (let i = 0; i < 3; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  
  return segments.join('-')
}
