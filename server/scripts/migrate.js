const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up database migrations...');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const databaseProvider = process.env.DATABASE_PROVIDER || (isProduction ? 'postgresql' : 'sqlite');

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database Provider: ${databaseProvider}`);

try {
  if (isProduction) {
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
  
  console.log('Database migrations completed successfully!');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}
