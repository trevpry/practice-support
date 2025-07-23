#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build process...');

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.DATABASE_URL?.includes('postgres') ||
                     process.env.RENDER || 
                     process.env.VERCEL ||
                     process.env.HEROKU;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

try {
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('npm --prefix client install', { stdio: 'inherit' });

  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  execSync('npm --prefix server install', { stdio: 'inherit' });

  // Production-specific database setup
  if (isProduction) {
    console.log('🔧 Production environment detected - setting up database...');
    
    // Deploy migrations safely (preserves data)
    console.log('📊 Deploying database migrations...');
    execSync('cd server && npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Generate Prisma client
    console.log('⚙️ Generating Prisma client...');
    execSync('cd server && npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Production database setup completed');
  } else {
    // Development setup (skip on Windows due to permission issues)
    if (process.platform !== 'win32') {
      console.log('🔧 Setting up database...');
      execSync('npm --prefix server run db:setup', { stdio: 'inherit' });
    } else {
      console.log('⏭️ Skipping database setup on Windows (development)');
    }
  }

  // Build client
  console.log('🏗️ Building client...');
  execSync('npm --prefix client run build', { stdio: 'inherit' });

  // Development database migration (skip on Windows and production)
  if (!isProduction && process.platform !== 'win32') {
    console.log('📊 Running development database migration...');
    execSync('npm --prefix server run db:migrate', { stdio: 'inherit' });
  }

  // Create server/public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'server', 'public');
  if (!fs.existsSync(publicDir)) {
    console.log('📁 Creating server/public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy client build files to server/public
  const clientBuildDir = path.join(__dirname, '..', 'client', 'build');
  if (fs.existsSync(clientBuildDir)) {
    console.log('📋 Copying client build files to server/public...');
    
    // Copy all files from client/build to server/public
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
  } else {
    console.log('⚠️ No client build directory found - skipping file copy');
  }

  if (isProduction) {
    console.log('🎉 Production build completed successfully!');
    console.log('✅ Database migrations deployed safely');
    console.log('✅ Prisma client generated');
    console.log('✅ Client files built and copied');
  } else {
    console.log('🎉 Development build completed successfully!');
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  if (isProduction) {
    console.error('💡 Production build troubleshooting:');
    console.error('   - Check DATABASE_URL environment variable');
    console.error('   - Verify database connectivity');
    console.error('   - Ensure migrations directory exists');
  }
  process.exit(1);
}
