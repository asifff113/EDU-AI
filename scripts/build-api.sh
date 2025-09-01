#!/bin/bash
set -e

echo "🚀 Building EDU AI API..."

# Enable corepack for pnpm support
corepack enable
corepack prepare pnpm@latest --activate

# Install all dependencies from root
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/api
pnpm prisma generate

# Build the API
echo "🏗️ Building API..."
pnpm run build

echo "✅ API build completed successfully!"
