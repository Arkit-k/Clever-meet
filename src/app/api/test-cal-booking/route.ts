import { NextRequest, NextResponse } from "next/server"

// Test endpoint to simulate a Cal.com booking webhook
// This helps us test the meeting approval workflow without setting up actual Cal.com webhooks
export async function POST(request: NextRequest) {
  try {
    const { freelancerEmail, clientEmail, clientName } = await request.json()

    // Simulate Cal.com webhook payload
    const testPayload = {
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: `test-${Date.now()}`,
        title: "Discovery Call",
        description: "15-minute discovery call to discuss project requirements",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), // Tomorrow + 15 min
        attendees: [
          {
            email: clientEmail,
            name: clientName
          }
        ],
        organizer: {
          email: freelancerEmail,
          username: freelancerEmail.split('@')[0] // Use email prefix as username
        },
        metadata: {
          videoCallUrl: "https://meet.google.com/test-meeting-room"
        }
      }
    }

    // Forward to the actual Cal.com webhook handler
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhooks/cal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    if (webhookResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        message: "Test Cal.com booking created successfully",
        payload: testPayload
      })
    } else {
      const error = await webhookResponse.text()
      return NextResponse.json({ 
        success: false, 
        error: "Failed to process test booking",
        details: error
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Error creating test Cal.com booking:", error)
    return NextResponse.json(
      { error: "Failed to create test booking" },
      { status: 500 }
    )
  }
}
