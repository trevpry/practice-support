#!/usr/bin/env node

// Simplified build script for Render with memory optimization
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Render-optimized build...');

// Detect production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL?.includes('postgres') ||
                     process.env.RENDER || 
                     process.env.VERCEL ||
                     process.env.HEROKU;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

try {
  // Step 1: Install dependencies with basic optimization
  console.log('📦 Installing dependencies...');
  
  const basicOptions = {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  };

  execSync('npm --prefix client install --prefer-offline --no-audit --no-fund', basicOptions);
  execSync('npm --prefix server install --prefer-offline --no-audit --no-fund', basicOptions);

  // Step 2: Prisma operations
  if (isProduction) {
    console.log('🔧 Setting up production database...');
    
    execSync('cd server && npx prisma migrate deploy', basicOptions);
    execSync('cd server && npx prisma generate', basicOptions);
    
    console.log('✅ Database setup completed');
  }

  // Step 3: Build client with memory optimization
  console.log('🏗️ Building client...');
  
  const buildOptions = {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=5120',
      CI: 'true',
      GENERATE_SOURCEMAP: 'false',
      INLINE_RUNTIME_CHUNK: 'false',
      IMAGE_INLINE_SIZE_LIMIT: '0'
    }
  };

  execSync('npm --prefix client run build', buildOptions);

  // Step 4: Copy build files
  console.log('📋 Copying build files...');
  
  const publicDir = path.join(__dirname, '..', 'server', 'public');
  const clientBuildDir = path.join(__dirname, '..', 'client', 'build');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (fs.existsSync(clientBuildDir)) {
    // Simple file copying for cross-platform compatibility
    const copyRecursive = (src, dest) => {
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        files.forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    const files = fs.readdirSync(clientBuildDir);
    files.forEach(file => {
      const srcPath = path.join(clientBuildDir, file);
      const destPath = path.join(publicDir, file);
      copyRecursive(srcPath, destPath);
    });
  }

  console.log('🎉 Render build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('💡 Try using the minimal build command: npm run build:minimal');
  process.exit(1);
}
