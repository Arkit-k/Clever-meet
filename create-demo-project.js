const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createDemoProject() {
  try {
    const users = await prisma.user.findMany()
    const client = users.find(u => u.role === 'CLIENT')
    const freelancer = users.find(u => u.role === 'FREELANCER')
    
    if (client && freelancer) {
      const project = await prisma.project.create({
        data: {
          clientId: client.id,
          freelancerId: freelancer.id,
          title: 'ClearAway Meetboard Demo Project',
          description: 'Demo project to showcase meetboard functionality after client approval',
          totalAmount: 2500,
          status: 'ACTIVE',
          startDate: new Date()
        }
      })
      
      // Add some demo messages
      await prisma.message.create({
        data: {
          content: "Welcome to your project meetboard! 🎉 This is where we'll collaborate throughout the project.",
          senderId: client.id,
          projectId: project.id
        }
      })

      await prisma.message.create({
        data: {
          content: "Thank you! I'm excited to work on this project. Let me know if you have any questions or requirements to discuss.",
          senderId: freelancer.id,
          projectId: project.id
        }
      })
      
      console.log('✅ Demo project created:', project.id)
      console.log('👤 Client:', client.name)
      console.log('👨‍💻 Freelancer:', freelancer.name)
      console.log('🚀 Meetboard URL: http://localhost:3000/projects/' + project.id + '/meetboard')
      console.log('📋 Projects Dashboard: http://localhost:3000/dashboard/projects')
      
      console.log('\n🎯 To test the meetboard:')
      console.log('1. Login as client or freelancer')
      console.log('2. Go to Projects in sidebar')
      console.log('3. Click "Open Meetboard" on the demo project')
      console.log('4. Test real-time chat and collaboration features')
    } else {
      console.log('❌ Need both client and freelancer users')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoProject()
