#!/bin/bash
# Pre-deployment build verification script

set -e

echo "🔍 Pre-deployment verification starting..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Check pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed"
    exit 1
fi

echo "✅ Project structure looks good"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/api
pnpm prisma generate
cd ../..

# Build API
echo "🏗️ Building API..."
cd apps/api
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ API build failed"
    exit 1
fi
echo "✅ API build successful"
cd ../..

# Build Web
echo "🎨 Building Web frontend..."
cd apps/web
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed" 
    exit 1
fi
echo "✅ Web build successful"
cd ../..

echo "🎉 Pre-deployment verification completed successfully!"
echo "📋 Ready for deployment to Render"
