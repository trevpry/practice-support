#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production server...');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL?.includes('postgres') ||
                     process.env.RENDER || 
                     process.env.VERCEL ||
                     process.env.HEROKU;

if (isProduction) {
  console.log('🌍 Production environment detected');
  
  try {
    // Ensure Prisma client is generated
    console.log('⚙️ Ensuring Prisma client is ready...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Check if migrations need to be deployed
    console.log('📊 Checking migration status...');
    try {
      const migrateStatus = execSync('npx prisma migrate status', { encoding: 'utf8' });
      if (migrateStatus.includes('pending') || migrateStatus.includes('not yet been applied')) {
        console.log('📈 Deploying pending migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } else {
        console.log('✅ Database is up to date');
      }
    } catch (statusError) {
      // If status check fails, try to deploy migrations anyway
      console.log('⚠️ Could not check migration status, attempting deploy...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
    
    console.log('✅ Production setup completed');
  } catch (error) {
    console.error('❌ Production setup failed:', error.message);
    console.log('💡 Continuing with server start - database might need manual intervention');
  }
} else {
  console.log('🔧 Development environment - skipping production setup');
}

// Start the server
console.log('🌐 Starting Express server...');
require('../src/app.js');
