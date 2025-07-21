#!/usr/bin/env bash
# exit on error
set -o errexit

# Export environment variables for production
export NODE_ENV=production
export DATABASE_PROVIDER=postgresql

echo "Starting Render build process..."

# Install root dependencies first
echo "Installing root dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
echo "Client dependencies installed"

# Check if vite is available
echo "Checking Vite installation..."
npx vite --version || echo "Vite not found via npx"

# Build the client using npx to ensure vite is found
echo "Building client with Vite using npx..."
npx vite build
echo "Client build completed"

# Go back to root and install server dependencies
cd ../server
echo "Installing server dependencies..."
npm install

# Setup database schema for production
echo "Setting up database for production..."
npm run db:setup

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database setup (uses db push for PostgreSQL)
echo "Setting up database schema..."
npm run db:migrate

# Copy client build to server public directory
echo "Copying client build to server..."
cd ..
cp -r client/dist/* server/public/

echo "Build process completed successfully!"
