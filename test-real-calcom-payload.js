// Test with real Cal.com payload format

async function testRealCalcomPayload() {
  const ngrokUrl = 'https://4b008e700e9f.ngrok-free.app'
  const webhookUrl = `${ngrokUrl}/api/webhooks/cal`
  
  console.log('🎯 Testing with REAL Cal.com payload format...')
  
  // Real Cal.com payload structure based on documentation
  const realCalcomPayload = {
    "triggerEvent": "BOOKING_CREATED",
    "createdAt": "2025-07-29T18:00:00.538Z",
    "payload": {
      "type": "15min",
      "title": "15min between ruppaam and Test Client",
      "description": "Quick consultation call",
      "additionalNotes": "",
      "customInputs": {},
      "startTime": "2025-07-30T10:00:00Z",
      "endTime": "2025-07-30T10:15:00Z",
      "organizer": {
        "id": 1,
        "name": "ruppaam",
        "email": "Arkitkarmokar@gmail.com", // This should match a freelancer in your system
        "username": "arkit-karmokar-6a25jx",
        "timeZone": "Asia/Kolkata",
        "language": {
          "locale": "en"
        },
        "timeFormat": "h:mma"
      },
      "responses": {
        "name": {
          "label": "your_name",
          "value": "Real Test Client"
        },
        "email": {
          "label": "email_address",
          "value": "realtest@example.com"
        }
      },
      "attendees": [
        {
          "email": "realtest@example.com",
          "name": "Real Test Client",
          "timeZone": "Asia/Kolkata",
          "language": {
            "locale": "en"
          }
        }
      ],
      "location": "Video Call",
      "uid": "realtest-" + Date.now(),
      "eventTypeId": 1,
      "bookingId": 999,
      "metadata": {
        "videoCallUrl": "https://whereby.com/clearaway-real-test-meeting"
      },
      "status": "ACCEPTED"
    }
  }
  
  try {
    console.log('📤 Sending real Cal.com payload...')
    console.log('👤 Organizer:', realCalcomPayload.payload.organizer.email)
    console.log('👥 Attendee:', realCalcomPayload.payload.attendees[0].email)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cal.com-Webhook/1.0'
      },
      body: JSON.stringify(realCalcomPayload)
    })
    
    console.log(`📥 Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Real Cal.com payload processed!')
      console.log('📋 Response:', result)
    } else {
      console.log('❌ Failed to process payload')
      const error = await response.text()
      console.log('Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Error testing real Cal.com payload:', error.message)
  }
}

testRealCalcomPayload()
