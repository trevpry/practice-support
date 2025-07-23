#!/usr/bin/env node

// Optimized build script for memory-constrained environments like Render
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting memory-optimized build for Render...');

// Force garbage collection more frequently
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 30000);
}

// Detect production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL?.includes('postgres') ||
                     process.env.RENDER || 
                     process.env.VERCEL ||
                     process.env.HEROKU;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

try {
  // Step 1: Install dependencies with aggressive optimization
  console.log('📦 Installing dependencies with maximum optimization...');
  
  const installOptions = {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=4096 --optimize-for-size',
      NODE_ENV: 'production'
    }
  };

  execSync('npm --prefix client install --production=false --prefer-offline --no-audit --no-fund --no-optional', installOptions);
  execSync('npm --prefix server install --production=false --prefer-offline --no-audit --no-fund --no-optional', installOptions);

  // Step 2: Prisma operations with memory limits
  if (isProduction) {
    console.log('🔧 Setting up production database...');
    
    const prismaOptions = {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_OPTIONS: '--max-old-space-size=2048'
      }
    };

    execSync('cd server && npx prisma migrate deploy', prismaOptions);
    execSync('cd server && npx prisma generate', prismaOptions);
    
    console.log('✅ Database setup completed');
  }

  // Step 3: Build client with maximum memory optimization
  console.log('🏗️ Building client with maximum memory optimization...');
  
  const buildOptions = {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=5120 --optimize-for-size',
      CI: 'true',
      GENERATE_SOURCEMAP: 'false',
      INLINE_RUNTIME_CHUNK: 'false',
      IMAGE_INLINE_SIZE_LIMIT: '0',
      FAST_REFRESH: 'false'
    }
  };

  execSync('npm --prefix client run build', buildOptions);

  // Step 4: Copy build files efficiently
  console.log('📋 Copying build files...');
  
  const publicDir = path.join(__dirname, '..', 'server', 'public');
  const clientBuildDir = path.join(__dirname, '..', 'client', 'build');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (fs.existsSync(clientBuildDir)) {
    // Use efficient file copying
    execSync(`cp -r "${clientBuildDir}"/* "${publicDir}"/`, { stdio: 'inherit' });
  }

  console.log('🎉 Memory-optimized build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('💡 Memory optimization tips for Render:');
  console.error('   - Try reducing Node.js memory allocation');
  console.error('   - Consider using a smaller build process');
  console.error('   - Check for memory leaks in dependencies');
  process.exit(1);
}
