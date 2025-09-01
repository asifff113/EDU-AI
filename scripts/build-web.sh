#!/bin/bash
set -e

echo "🚀 Building EDU AI Web..."

# Enable corepack for pnpm support
corepack enable
corepack prepare pnpm@latest --activate

# Install all dependencies from root
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the web app
echo "🏗️ Building Web app..."
cd apps/web
pnpm run build

echo "✅ Web build completed successfully!"
