const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing development environment...');

// 1. Check if .next exists and remove it
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('📁 Removing .next directory...');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next directory removed');
  } catch (error) {
    console.log('⚠️ Could not remove .next directory:', error.message);
  }
}

// 2. Check if node_modules exists
const nodeModulesDir = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('❌ node_modules not found. Please run: npm install');
  process.exit(1);
}

// 3. Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json not found');
  process.exit(1);
}

// 4. Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

// 5. Check if prisma schema exists
const prismaSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaSchemaPath)) {
  console.log('❌ Prisma schema not found');
  process.exit(1);
}

console.log('✅ All checks passed!');
console.log('🚀 Try running: npm run dev');
