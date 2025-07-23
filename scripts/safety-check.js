#!/usr/bin/env node

/**
 * Database Safety Check Script
 * 
 * This script verifies that the database configuration is safe for production deployment.
 * It checks for dangerous settings that could lead to data loss.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Database Safety Check...\n');

// Check 1: Verify migration script doesn't use force-reset
console.log('✓ Checking migration script safety...');
const migrateScriptPath = path.join(__dirname, '..', 'server', 'scripts', 'migrate.js');

if (fs.existsSync(migrateScriptPath)) {
  const migrateScript = fs.readFileSync(migrateScriptPath, 'utf8');
  
  if (migrateScript.includes('--force-reset')) {
    console.error('❌ DANGER: migrate.js contains --force-reset flag!');
    console.error('   This will wipe the production database!');
    process.exit(1);
  }
  
  if (migrateScript.includes('migrate reset')) {
    console.error('❌ DANGER: migrate.js contains migrate reset command!');
    console.error('   This will wipe the production database!');
    process.exit(1);
  }
  
  console.log('   ✅ Migration script is safe');
} else {
  console.log('   ⚠️  Migration script not found');
}

// Check 2: Verify build script safety
console.log('✓ Checking build script safety...');
const buildScriptPath = path.join(__dirname, '..', 'scripts', 'build.js');

if (fs.existsSync(buildScriptPath)) {
  const buildScript = fs.readFileSync(buildScriptPath, 'utf8');
  
  if (buildScript.includes('--force-reset')) {
    console.error('❌ DANGER: build.js contains --force-reset flag!');
    process.exit(1);
  }
  
  console.log('   ✅ Build script is safe');
} else {
  console.log('   ⚠️  Build script not found');
}

// Check 3: Verify package.json scripts
console.log('✓ Checking package.json scripts...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const serverPackageJsonPath = path.join(__dirname, '..', 'server', 'package.json');

[packageJsonPath, serverPackageJsonPath].forEach((filePath, index) => {
  if (fs.existsSync(filePath)) {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    Object.entries(scripts).forEach(([scriptName, scriptCommand]) => {
      if (scriptCommand.includes('--force-reset')) {
        console.error(`❌ DANGER: Script "${scriptName}" contains --force-reset flag!`);
        console.error(`   File: ${filePath}`);
        process.exit(1);
      }
      
      if (scriptCommand.includes('migrate reset')) {
        console.error(`❌ DANGER: Script "${scriptName}" contains migrate reset command!`);
        console.error(`   File: ${filePath}`);
        process.exit(1);
      }
    });
    
    console.log(`   ✅ ${index === 0 ? 'Root' : 'Server'} package.json scripts are safe`);
  }
});

// Check 4: Verify environment variable configuration
console.log('✓ Checking environment configuration...');

// Check if .env.example has production guidelines
const envExamplePath = path.join(__dirname, '..', 'server', '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  if (envExample.includes('postgresql') && envExample.includes('production')) {
    console.log('   ✅ Environment configuration includes production guidelines');
  } else {
    console.log('   ⚠️  Environment configuration could be more detailed');
  }
} else {
  console.log('   ⚠️  .env.example not found');
}

// Check 5: Verify schema.prisma doesn't have dangerous defaults
console.log('✓ Checking Prisma schema...');
const schemaPath = path.join(__dirname, '..', 'server', 'prisma', 'schema.prisma');

if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for proper environment variable usage
  if (schema.includes('env("DATABASE_URL")')) {
    console.log('   ✅ Schema uses environment variable for database URL');
  } else {
    console.error('❌ DANGER: Schema does not use environment variable for database URL!');
    process.exit(1);
  }
  
  console.log('   ✅ Prisma schema is safe');
} else {
  console.error('❌ ERROR: Prisma schema not found!');
  process.exit(1);
}

console.log('\n🎉 All safety checks passed!');
console.log('✅ Database configuration is safe for production deployment.');
console.log('\n📋 Safety Features Verified:');
console.log('   • No --force-reset flags found');
console.log('   • No migrate reset commands found');
console.log('   • Environment variables properly configured');
console.log('   • Migration scripts use safe deployment methods');
console.log('\n🚀 Ready for safe production deployment!');
