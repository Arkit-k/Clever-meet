// Test the complete flow: Booking → Approval → Meeting → Client Decision → Collaboration

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCompleteFlow() {
  try {
    console.log('🚀 Testing Complete Flow: Booking → Approval → Meeting → Client Decision → Collaboration\n')
    
    // Step 1: Create a Cal.com booking
    console.log('1️⃣ Creating Cal.com booking...')
    const bookingResponse = await fetch('http://localhost:3000/api/test-cal-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        freelancerEmail: 'Arkitkarmokar@gmail.com',
        clientEmail: 'completeflow@example.com',
        clientName: 'Complete Flow Test Client'
      })
    })
    
    if (!bookingResponse.ok) {
      throw new Error('Failed to create booking')
    }
    
    console.log('✅ Booking created successfully')
    
    // Step 2: Find the created meeting
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for DB
    
    const meeting = await prisma.meeting.findFirst({
      where: {
        client: {
          email: 'completeflow@example.com'
        }
      },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!meeting) {
      throw new Error('Meeting not found')
    }
    
    console.log('✅ Meeting found:', {
      id: meeting.id,
      status: meeting.status,
      client: meeting.client.email,
      freelancer: meeting.freelancer.email
    })
    
    // Step 3: Simulate freelancer approval
    console.log('\n2️⃣ Simulating freelancer approval...')
    const approvalResponse = await fetch(`http://localhost:3000/api/meetings/${meeting.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    })
    
    console.log(`📥 Approval API Status: ${approvalResponse.status}`)
    if (approvalResponse.status === 401) {
      console.log('⚠️ Expected: Requires authentication (freelancer must be logged in)')
    }
    
    // Manually update for testing
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'CONFIRMED' }
    })
    console.log('✅ Meeting approved (simulated)')
    
    // Step 4: Simulate meeting completion
    console.log('\n3️⃣ Simulating meeting completion...')
    const completionResponse = await fetch(`http://localhost:3000/api/meetings/${meeting.id}/complete`, {
      method: 'POST'
    })
    
    if (completionResponse.ok) {
      const completionData = await completionResponse.json()
      console.log('✅ Meeting completed:', completionData.message)
      console.log('🔗 Client decision URL:', `http://localhost:3000${completionData.clientDecisionUrl}`)
    }
    
    // Step 5: Show the complete flow URLs
    console.log('\n4️⃣ Complete Flow URLs for Manual Testing:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Freelancer Login: http://localhost:3000/auth/signin')
    console.log('👤 Freelancer Email: Arkitkarmokar@gmail.com')
    console.log('📅 Meetings Dashboard: http://localhost:3000/dashboard/meetings')
    console.log(`🎯 Meeting Room: http://localhost:3000/meeting-room/${meeting.id}`)
    console.log(`🎯 Meeting Board: http://localhost:3000/meeting/${meeting.id}`)
    console.log(`🎯 Client Decision: http://localhost:3000/client-decision/${meeting.id}`)
    
    console.log('\n📋 Manual Test Steps:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Login as freelancer → Go to meetings dashboard')
    console.log('2. Find pending meeting → Click "Accept Meeting"')
    console.log('3. Go to meeting room → Click "Enter Meeting Board"')
    console.log('4. In meeting board → Click "Complete Meeting (Test)"')
    console.log('5. If you\'re client → You\'ll be redirected to decision page')
    console.log('6. Click "Approve & Continue" → Redirected to collaboration workspace')
    console.log('7. If you\'re freelancer → You\'ll see "waiting for client decision"')
    
    console.log('\n🎯 Expected Flow:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('PENDING → CONFIRMED → AWAITING_CLIENT_DECISION → CLIENT_APPROVED → Collaboration')
    
    // Check current meeting status
    const updatedMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id }
    })
    console.log(`\n📊 Current Meeting Status: ${updatedMeeting?.status}`)
    
  } catch (error) {
    console.error('❌ Error in complete flow test:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteFlow()
