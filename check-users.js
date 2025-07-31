const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true
      }
    })
    
    console.log('👥 Users in system:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`)
      console.log(`    Role: ${user.role}`)
      console.log(`    Has password: ${user.password ? 'Yes' : 'No'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
