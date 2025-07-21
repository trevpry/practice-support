const fs = require('fs');
const path = require('path');

// Read the current schema.prisma file
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Determine database provider based on environment
const isProduction = process.env.NODE_ENV === 'production';
const databaseProvider = process.env.DATABASE_PROVIDER || (isProduction ? 'postgresql' : 'sqlite');

console.log(`Setting up schema for ${databaseProvider} database...`);

// Update the datasource db provider
if (databaseProvider === 'postgresql') {
  schemaContent = schemaContent.replace(
    /datasource db \{[\s\S]*?provider = "sqlite"[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
} else {
  schemaContent = schemaContent.replace(
    /datasource db \{[\s\S]*?provider = "postgresql"[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
  );
}

// Write the updated schema back to file
fs.writeFileSync(schemaPath, schemaContent);

console.log(`Schema updated for ${databaseProvider}`);
console.log('Generating Prisma client...');

// Generate Prisma client
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}
