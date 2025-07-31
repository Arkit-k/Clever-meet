import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { scheduleMeetingReminder } from "@/lib/meeting-reminders"
import { notifyMeetingRequest } from "@/lib/notifications"

// Webhook endpoint for Cal.com bookings
// This would sync Cal.com bookings back to our MeetBoard system
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log('🔔 Cal.com webhook received:', {
      triggerEvent: payload.triggerEvent,
      timestamp: new Date().toISOString()
    })

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-cal-signature')
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    // Cal.com webhook payload structure
    const {
      triggerEvent,
      payload: eventData
    } = payload

    if (triggerEvent === "BOOKING_CREATED") {
      const {
        uid,
        title,
        description,
        startTime,
        endTime,
        attendees,
        organizer,
        metadata
      } = eventData

      console.log('📋 Processing BOOKING_CREATED:', {
        uid,
        title,
        organizer: organizer?.email,
        attendees: attendees?.map(a => a.email)
      })

      // Find the freelancer by Cal.com email
      // The organizer.email should match a freelancer's email in our system
      const freelancer = await prisma.freelancerProfile.findFirst({
        where: {
          OR: [
            { calLink: { contains: organizer?.username || '' } },
            { user: { email: organizer?.email } } // Primary matching method
          ]
        },
        include: {
          user: true
        }
      })

      console.log(`🔍 Looking for freelancer with Cal.com email: ${organizer?.email}`)
      console.log(`🔍 Found freelancer: ${freelancer ? freelancer.user.name : 'None'}`)

      if (!freelancer) {
        console.log("❌ Freelancer not found for Cal.com booking")
        return NextResponse.json({
          received: true,
          error: "Freelancer not found",
          organizer_email: organizer?.email
        })
      }

      // Find or create client user
      const clientEmail = attendees?.[0]?.email
      const clientName = attendees?.[0]?.name

      if (!clientEmail) {
        console.log("No client email in Cal.com booking")
        return NextResponse.json({ received: true })
      }

      let client = await prisma.user.findUnique({
        where: { email: clientEmail }
      })

      if (!client) {
        // Create a new client user
        client = await prisma.user.create({
          data: {
            name: clientName || "Cal.com Client",
            email: clientEmail,
            role: "CLIENT"
          }
        })
      }

      // Determine if this is a discovery meeting (15-30 minutes)
      const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))
      const isDiscoveryMeeting = duration <= 30 && (title?.toLowerCase().includes('discovery') || title?.toLowerCase().includes('consultation') || duration === 15)

      // Create meeting in our system
      const meeting = await prisma.meeting.create({
        data: {
          clientId: client.id,
          freelancerId: freelancer.userId,
          title: title || "Cal.com Meeting",
          description: description || "Meeting booked via Cal.com",
          scheduledAt: new Date(startTime),
          duration: duration,
          status: isDiscoveryMeeting ? "CONFIRMED" : "PENDING", // Discovery meetings auto-confirmed
          meetingUrl: metadata?.videoCallUrl || `https://whereby.com/clearaway-discovery-${uid}`,
          notes: `Synced from Cal.com booking: ${uid}${isDiscoveryMeeting ? ' [DISCOVERY]' : ''}`,
          type: isDiscoveryMeeting ? 'DISCOVERY' : 'REGULAR'
        }
      })

      if (isDiscoveryMeeting) {
        // Discovery meetings are auto-confirmed, notify both parties
        console.log(`🔍 Discovery meeting detected - auto-confirmed`)
        // Schedule reminder for 1 hour before meeting
        await scheduleMeetingReminder(meeting.id, new Date(startTime))
      } else {
        // Regular meetings need freelancer approval
        await notifyMeetingRequest(meeting.id, client.id, freelancer.userId)
        // Schedule reminder for 1 hour before meeting
        await scheduleMeetingReminder(meeting.id, new Date(startTime))
      }

      console.log(`✅ Synced Cal.com booking ${uid} to MeetBoard - Status: ${isDiscoveryMeeting ? 'CONFIRMED (Discovery)' : 'PENDING (awaiting freelancer approval)'}`)
      console.log(`⏰ Reminder scheduled for 1 hour before meeting`)
    } else if (triggerEvent === "BOOKING_CANCELLED") {
      // Handle booking cancellation
      const { uid } = eventData

      // Find and update the meeting status
      const meeting = await prisma.meeting.findFirst({
        where: {
          notes: {
            contains: uid
          }
        }
      })

      if (meeting) {
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: "CANCELLED" }
        })
        console.log(`✅ Cancelled Cal.com booking ${uid} in MeetBoard`)
      }
    } else {
      console.log(`ℹ️ Unhandled Cal.com event: ${triggerEvent}`)
    }

    return NextResponse.json({ received: true, event: triggerEvent })
  } catch (error) {
    console.error("Error processing Cal.com webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Helper function to verify webhook signature (implement in production)
function verifySignature(payload: any, signature: string | null): boolean {
  // Implement Cal.com webhook signature verification
  // This is crucial for security in production
  return true // For MVP, we'll skip verification
}
