const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Generating Prisma client...');
  
  // Try to run prisma generate
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
  
  // Try alternative approach
  try {
    console.log('Trying alternative approach...');
    execSync('node_modules\\.bin\\prisma generate', { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('Prisma client generated successfully with alternative approach!');
  } catch (altError) {
    console.error('Alternative approach also failed:', altError.message);
    process.exit(1);
  }
}
