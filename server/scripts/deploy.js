#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...');

// Function to run shell commands
function runCommand(command, description) {
  console.log(`\n⏳ ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgres');

if (isProduction) {
  console.log('🌍 Production environment detected');
  
  // Deploy migrations to production database
  runCommand('npx prisma migrate deploy', 'Deploying database migrations');
  
  // Generate Prisma client
  runCommand('npx prisma generate', 'Generating Prisma client');
  
  console.log('\n🎉 Production deployment completed successfully!');
  console.log('📝 Database migrations have been applied safely');
  console.log('🔄 Prisma client has been regenerated');
  
} else {
  console.log('🔧 Development environment detected');
  
  // Run development migrations
  runCommand('npx prisma migrate dev', 'Running development migrations');
  
  // Generate Prisma client
  runCommand('npx prisma generate', 'Generating Prisma client');
  
  console.log('\n🎉 Development setup completed successfully!');
}

console.log('\n📋 Next steps:');
console.log('   - Restart your server to use the updated Prisma client');
console.log('   - Test API endpoints to verify everything works correctly');
