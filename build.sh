#!/bin/bash
set -e

echo "Starting build process..."

# Install dependencies
npm ci

# Build the application
npm run build

# Push database schema
npm run db:push

echo "Build completed successfully!"