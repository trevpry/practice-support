#!/usr/bin/env bash
# exit on error
set -o errexit

# Export environment variables for production
export NODE_ENV=production
export DATABASE_PROVIDER=postgresql

echo "Starting Render build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup database schema for production
echo "Setting up database for production..."
cd server && npm run db:setup

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Build the client
echo "Building client..."
cd ../client && npm run build

# Copy client build to server public directory
echo "Copying client build to server..."
cp -r dist/* ../server/public/

echo "Build process completed successfully!"
