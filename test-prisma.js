const { PrismaClient } = require('@prisma/client');

try {
  console.log('Testing Prisma client initialization...');
  const prisma = new PrismaClient();
  console.log('Prisma client created successfully!');
  
  // Test a simple query
  prisma.$connect().then(() => {
    console.log('Prisma client connected successfully!');
    return prisma.$disconnect();
  }).then(() => {
    console.log('Prisma client disconnected successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Error creating Prisma client:', error);
  process.exit(1);
}
