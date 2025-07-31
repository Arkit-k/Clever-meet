// Test the webhook endpoint from external access (via ngrok)

async function testExternalWebhook() {
  const ngrokUrl = 'https://4b008e700e9f.ngrok-free.app'
  const webhookUrl = `${ngrokUrl}/api/webhooks/cal`
  
  console.log('🌐 Testing webhook accessibility from external URL...')
  console.log(`📡 Webhook URL: ${webhookUrl}`)
  
  // Test payload that matches Cal.com structure
  const testPayload = {
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: `external-test-${Date.now()}`,
      title: "External Test Meeting",
      description: "Testing webhook from external URL",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      attendees: [
        {
          email: 'external-test@example.com',
          name: 'External Test Client'
        }
      ],
      organizer: {
        email: 'mohitoshkarmokar8720@gmail.com', // Existing freelancer
        username: 'mohitoshkarmokar8720'
      },
      metadata: {
        videoCallUrl: "https://whereby.com/clearaway-external-test"
      }
    }
  }
  
  try {
    console.log('📤 Sending test webhook...')
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cal.com-Webhook/1.0'
      },
      body: JSON.stringify(testPayload)
    })
    
    console.log(`📥 Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Webhook accessible and working!')
      console.log('📋 Response:', result)
      
      // Check if meeting was created
      console.log('\n🔍 Checking if meeting was created...')
      // We'll check this manually in the database
      
    } else {
      console.log('❌ Webhook not accessible')
      const error = await response.text()
      console.log('Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Error testing external webhook:', error.message)
  }
}

testExternalWebhook()
