// Test the API endpoints to see what's working and what's not

async function testAPI() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing API endpoints...\n')
  
  // Test 1: Test Cal.com webhook simulation
  console.log('1️⃣ Testing Cal.com booking simulation...')
  try {
    const response = await fetch(`${baseUrl}/api/test-cal-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        freelancerEmail: 'mohitoshkarmokar8720@gmail.com', // Existing freelancer
        clientEmail: 'testclient@example.com',
        clientName: 'Test Client'
      })
    })
    
    const result = await response.json()
    console.log(`   Status: ${response.status}`)
    console.log(`   Result:`, result)
  } catch (error) {
    console.error('   ❌ Error:', error.message)
  }
  
  console.log('\n2️⃣ Testing meetings API...')
  try {
    const response = await fetch(`${baseUrl}/api/meetings`)
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log(`   Meetings found: ${result.meetings?.length || 0}`)
    } else {
      const error = await response.text()
      console.log(`   Error: ${error}`)
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message)
  }
  
  console.log('\n3️⃣ Testing Cal.com webhook directly...')
  try {
    const testPayload = {
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: `test-direct-${Date.now()}`,
        title: "Direct Test Meeting",
        description: "Testing webhook directly",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        attendees: [
          {
            email: 'directtest@example.com',
            name: 'Direct Test Client'
          }
        ],
        organizer: {
          email: 'mohitoshkarmokar8720@gmail.com',
          username: 'mohitoshkarmokar8720'
        },
        metadata: {
          videoCallUrl: "https://meet.google.com/test-direct"
        }
      }
    }
    
    const response = await fetch(`${baseUrl}/api/webhooks/cal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    console.log(`   Status: ${response.status}`)
    const result = await response.json()
    console.log(`   Result:`, result)
  } catch (error) {
    console.error('   ❌ Error:', error.message)
  }
  
  console.log('\n✅ API testing complete')
}

testAPI()
