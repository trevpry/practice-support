const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up database migrations...');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const databaseProvider = process.env.DATABASE_PROVIDER || (isProduction ? 'postgresql' : 'sqlite');
const databaseUrl = process.env.DATABASE_URL;

console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  Database Provider: ${databaseProvider}`);
console.log(`🔗 Database URL: ${databaseUrl ? 'configured' : 'not configured'}`);

if (isProduction) {
  console.log('🔴 PRODUCTION DEPLOYMENT DETECTED');
  console.log('🛡️  Using SAFE migration strategy (preserves data)');
} else {
  console.log('🟡 Development environment detected');
}

try {
  if (isProduction && databaseProvider === 'postgresql') {
    console.log('🔧 Production PostgreSQL deployment detected');
    
    // Check if database already exists and has data
    try {
      console.log('🔍 Checking if database exists...');
      execSync('npx prisma db pull --force', { 
        stdio: 'pipe', 
        cwd: path.join(__dirname, '..') 
      });
      console.log('✅ Existing database detected');
      console.log('🚀 Running SAFE migrations (preserves all data)...');
      
      // Use migrate deploy for existing databases (SAFE - preserves data)
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
      });
      console.log('✅ Migrations applied successfully - data preserved!');
    } catch (pullError) {
      console.log('📝 No existing database found - creating initial schema...');
      console.log('🔧 Using SAFE schema creation (no force-reset)...');
      
      // For brand new databases, use db push WITHOUT force-reset (SAFE)
      execSync('npx prisma db push', { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
      });
      console.log('✅ New database schema created successfully!');
    }
    
    console.log('🎉 PostgreSQL deployment completed safely!');
  } else if (isProduction) {
    console.log('Running production migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
  } else {
    console.log('Running development migrations...');
    execSync('npx prisma migrate dev', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
  }
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
}
