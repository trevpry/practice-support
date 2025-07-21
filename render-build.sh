#!/usr/bin/env bash
# exit on error
set -o errexit

# Export environment variables for production
export NODE_ENV=production
export DATABASE_PROVIDER=postgresql

echo "Starting Render build process..."

# Install all dependencies from root
echo "Installing all dependencies..."
npm install

# Run the build using root package.json script
echo "Building application..."
npm run build

echo "Build process completed successfully!"
