#!/bin/bash
set -e

echo "🚀 Starting Render deployment build..."

# Enable corepack for pnpm support
corepack enable
corepack prepare pnpm@latest --activate

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
pnpm install --frozen-lockfile

# Build API
echo "🔧 Building API..."
cd apps/api
pnpm prisma generate
pnpm run build
cd ../..

# Build Web
echo "🎨 Building Web frontend..."
cd apps/web
pnpm run build
cd ../..

echo "✅ Build completed successfully!"
