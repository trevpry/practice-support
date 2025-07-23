#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Emergency Production Fix Script');
console.log('==================================');

try {
  console.log('\n1️⃣ Checking environment...');
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  
  console.log('\n2️⃣ Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('\n3️⃣ Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n✅ Fix completed successfully!');
  console.log('🔄 Please restart your server for changes to take effect.');
  
} catch (error) {
  console.error('\n❌ Fix failed:', error.message);
  console.log('\n📝 Manual steps to resolve:');
  console.log('1. Run: npx prisma migrate deploy');
  console.log('2. Run: npx prisma generate');
  console.log('3. Restart your server');
  process.exit(1);
}
