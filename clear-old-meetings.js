// Clear old test meetings and create new ones with proper timing

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearAndCreateNewMeetings() {
  try {
    console.log('🧹 Clearing old test meetings...')
    
    // Delete all existing meetings
    await prisma.meeting.deleteMany({})
    console.log('✅ Cleared all old meetings')
    
    // Get users
    const users = await prisma.user.findMany()
    const client = users.find(u => u.role === 'CLIENT')
    const freelancer = users.find(u => u.role === 'FREELANCER')
    
    if (!client || !freelancer) {
      console.log('❌ Need both client and freelancer users')
      return
    }
    
    console.log('\n📅 Creating new meetings with proper time-based visibility...')
    
    const now = new Date()
    
    // Meeting 1: Future meeting (2 hours from now) - Link should NOT be visible
    const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const futureMeeting = await prisma.meeting.create({
      data: {
        clientId: client.id,
        freelancerId: freelancer.id,
        title: "Future Strategy Meeting",
        description: "Meeting in 2 hours - link should not be visible yet",
        scheduledAt: futureTime,
        duration: 30,
        status: 'CONFIRMED',
        meetingUrl: 'https://whereby.com/clearaway-future-strategy'
      }
    })
    
    // Meeting 2: Soon meeting (30 minutes from now) - Link SHOULD be visible
    const soonTime = new Date(now.getTime() + 30 * 60 * 1000)
    const soonMeeting = await prisma.meeting.create({
      data: {
        clientId: client.id,
        freelancerId: freelancer.id,
        title: "Project Review Call",
        description: "Meeting in 30 minutes - link should be visible now",
        scheduledAt: soonTime,
        duration: 45,
        status: 'CONFIRMED',
        meetingUrl: 'https://whereby.com/clearaway-project-review'
      }
    })
    
    // Meeting 3: Current meeting (5 minutes from now) - Link should be visible + urgent
    const currentTime = new Date(now.getTime() + 5 * 60 * 1000)
    const currentMeeting = await prisma.meeting.create({
      data: {
        clientId: client.id,
        freelancerId: freelancer.id,
        title: "Quick Sync Call",
        description: "Meeting starting in 5 minutes - urgent join",
        scheduledAt: currentTime,
        duration: 15,
        status: 'CONFIRMED',
        meetingUrl: 'https://whereby.com/clearaway-quick-sync'
      }
    })
    
    console.log('\n✅ Created 3 new meetings with proper timing:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const meetings = [
      { meeting: futureMeeting, time: futureTime, name: "Future Strategy Meeting" },
      { meeting: soonMeeting, time: soonTime, name: "Project Review Call" },
      { meeting: currentMeeting, time: currentTime, name: "Quick Sync Call" }
    ]
    
    meetings.forEach(({ meeting, time, name }, index) => {
      const oneHourBefore = new Date(time.getTime() - 60 * 60 * 1000)
      const timeUntilMeeting = time.getTime() - now.getTime()
      const timeUntilLinkAvailable = oneHourBefore.getTime() - now.getTime()
      const isLinkAvailable = now >= oneHourBefore
      
      console.log(`${index + 1}. ${name}:`)
      console.log(`   📅 Meeting Time: ${time.toLocaleString()}`)
      console.log(`   🔗 Link Available: ${oneHourBefore.toLocaleString()}`)
      console.log(`   ⏰ Time Until Meeting: ${Math.round(timeUntilMeeting / 1000 / 60)} minutes`)
      console.log(`   🎯 Link Status: ${isLinkAvailable ? '✅ VISIBLE' : '❌ HIDDEN'}`)
      console.log(`   🌐 URL: http://localhost:3000/meeting/${meeting.id}`)
      
      if (!isLinkAvailable) {
        console.log(`   ⏳ Link visible in: ${Math.round(timeUntilLinkAvailable / 1000 / 60)} minutes`)
      }
      console.log('')
    })
    
    console.log('🎯 Test Results Expected:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Future Strategy Meeting → Orange "Link Pending" badge')
    console.log('2. Project Review Call → Green "Link Ready" badge')
    console.log('3. Quick Sync Call → Green "Link Ready" + urgent indicators')
    
    console.log('\n🚀 All old Google Meet/Zoom links removed!')
    console.log('🔗 New Whereby links with proper timing implemented!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAndCreateNewMeetings()
