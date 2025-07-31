// Test the complete approval/rejection flow

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testApprovalFlow() {
  try {
    console.log('🧪 Testing Complete Approval Flow...\n')
    
    // Step 1: Create a test booking
    console.log('1️⃣ Creating test booking...')
    const response = await fetch('http://localhost:3000/api/test-cal-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        freelancerEmail: 'Arkitkarmokar@gmail.com',
        clientEmail: 'approvaltest@example.com',
        clientName: 'Approval Test Client'
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create test booking')
    }
    
    const bookingResult = await response.json()
    console.log('✅ Test booking created successfully')
    
    // Step 2: Find the created meeting
    console.log('\n2️⃣ Finding created meeting...')
    const meeting = await prisma.meeting.findFirst({
      where: {
        client: {
          email: 'approvaltest@example.com'
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
      throw new Error('Meeting not found after creation')
    }
    
    console.log('✅ Meeting found:', {
      id: meeting.id,
      title: meeting.title,
      status: meeting.status,
      client: meeting.client.email,
      freelancer: meeting.freelancer.email
    })
    
    // Step 3: Test approval (simulate API call)
    console.log('\n3️⃣ Testing meeting approval...')
    console.log(`📋 Meeting ID: ${meeting.id}`)
    console.log(`📋 Current Status: ${meeting.status}`)
    
    // Simulate what happens when freelancer clicks "Accept"
    const approvalResponse = await fetch(`http://localhost:3000/api/meetings/${meeting.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    })
    
    console.log(`📥 Approval API Status: ${approvalResponse.status}`)
    
    if (approvalResponse.ok) {
      console.log('✅ Meeting approved successfully!')
      
      // Check updated status
      const updatedMeeting = await prisma.meeting.findUnique({
        where: { id: meeting.id }
      })
      console.log(`📋 New Status: ${updatedMeeting?.status}`)
    } else {
      console.log('❌ Approval failed - this is expected without authentication')
      console.log('💡 In real app, freelancer must be logged in to approve')
    }
    
    // Step 4: Show next steps
    console.log('\n4️⃣ Next Steps for Manual Testing:')
    console.log('🔗 Login URL: http://localhost:3000/auth/signin')
    console.log('👤 Freelancer Email: Arkitkarmokar@gmail.com')
    console.log('📅 Meetings Dashboard: http://localhost:3000/dashboard/meetings')
    console.log(`🎯 Meeting Room: http://localhost:3000/meeting/${meeting.id}`)
    
    console.log('\n📋 Manual Test Steps:')
    console.log('1. Login as freelancer (Arkitkarmokar@gmail.com)')
    console.log('2. Go to meetings dashboard')
    console.log('3. Find the pending meeting')
    console.log('4. Click "Accept Meeting" or "Decline Meeting"')
    console.log('5. Verify status changes')
    console.log('6. Access meeting room for collaboration')
    
  } catch (error) {
    console.error('❌ Error in approval flow test:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testApprovalFlow()
