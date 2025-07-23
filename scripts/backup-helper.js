#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script helps create backups before production deployments.
 * It provides instructions for PostgreSQL backups.
 */

const path = require('path');

console.log('💾 Database Backup Helper\n');

console.log('This script provides guidance for backing up your production database.');
console.log('Always create a backup before deploying to production!\n');

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (isProduction && databaseUrl) {
  console.log('🔴 PRODUCTION ENVIRONMENT DETECTED');
  console.log('📍 Database URL found in environment variables\n');
} else {
  console.log('🟡 Development/staging environment detected\n');
}

console.log('📋 Backup Instructions:\n');

console.log('1. PostgreSQL Database Backup:');
console.log('   Command: pg_dump "YOUR_DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql');
console.log('   Example: pg_dump "postgresql://user:pass@host:port/db" > backup_20250723_143000.sql\n');

console.log('2. Automated Backup (with timestamp):');
console.log('   pg_dump "$DATABASE_URL" > "backup_$(date +%Y%m%d_%H%M%S).sql"\n');

console.log('3. Compressed Backup (recommended for large databases):');
console.log('   pg_dump "$DATABASE_URL" | gzip > "backup_$(date +%Y%m%d_%H%M%S).sql.gz"\n');

console.log('4. Verify Backup:');
console.log('   ls -lh backup_*.sql*');
console.log('   # Check file size and timestamp\n');

console.log('🔄 Restore Instructions (if needed):\n');

console.log('1. Restore from backup:');
console.log('   psql "$DATABASE_URL" < backup_file.sql\n');

console.log('2. Restore compressed backup:');
console.log('   gunzip -c backup_file.sql.gz | psql "$DATABASE_URL"\n');

console.log('⚠️  IMPORTANT SAFETY NOTES:\n');
console.log('• Always test backups in a staging environment first');
console.log('• Store backups in a secure, separate location');
console.log('• Include schema and data in your backups');
console.log('• Document your backup and restore procedures');
console.log('• Consider automated daily backups for production\n');

console.log('🛡️  Additional Safety Measures:\n');
console.log('• Run "npm run safety-check" before deployment');
console.log('• Use "npm run pre-deploy" to verify safety settings');
console.log('• Monitor deployment logs for any issues');
console.log('• Have a rollback plan ready\n');

if (databaseUrl && databaseUrl.includes('postgresql://')) {
  console.log('🎯 Quick Backup Command for Your Database:');
  console.log(`   pg_dump "${databaseUrl.replace(/:[^:@]*@/, ':***@')}" > backup_$(date +%Y%m%d_%H%M%S).sql`);
  console.log('   (Password hidden for security)\n');
}

console.log('✅ Remember: A good backup is your best insurance against data loss!');
console.log('🚀 After backup is complete, you can safely proceed with deployment.');
