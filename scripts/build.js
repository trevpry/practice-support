#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build process...');

try {
  // Install client dependencies
  console.log('Installing client dependencies...');
  execSync('npm --prefix client install', { stdio: 'inherit' });

  // Install server dependencies
  console.log('Installing server dependencies...');
  execSync('npm --prefix server install', { stdio: 'inherit' });

  // Setup database (skip Prisma generation on Windows due to permission issues)
  if (process.platform !== 'win32') {
    console.log('Setting up database...');
    execSync('npm --prefix server run db:setup', { stdio: 'inherit' });
  } else {
    console.log('Skipping database setup on Windows (will be handled in production)');
  }

  // Build client
  console.log('Building client...');
  execSync('npm --prefix client run build', { stdio: 'inherit' });

  // Run database migration (skip on Windows)
  if (process.platform !== 'win32') {
    console.log('Running database migration...');
    execSync('npm --prefix server run db:migrate', { stdio: 'inherit' });
  } else {
    console.log('Skipping database migration on Windows (will be handled in production)');
  }

  // Create server/public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'server', 'public');
  if (!fs.existsSync(publicDir)) {
    console.log('Creating server/public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy client build files to server/public
  const clientBuildDir = path.join(__dirname, '..', 'client', 'build');
  if (fs.existsSync(clientBuildDir)) {
    console.log('Copying client build files to server/public...');
    
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
    console.log('No client build directory found - skipping file copy');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
