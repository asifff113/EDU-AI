# 🚀 EDU AI - Render Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Blueprint Deploy (Easiest)

1. **Fork this repo** to your GitHub account
2. **Connect to Render**: Go to [render.com](https://render.com) → New → Blueprint
3. **Select your repo** and deploy with `render.yaml`
4. **Set environment variables** in Render dashboard

### Option 2: Manual Service Creation

## 🔧 Backend API Deployment

### Create Web Service:

```
Name: edu-ai-api
Runtime: Node
Build Command: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile && cd apps/api && pnpm prisma generate && pnpm run build
Start Command: cd apps/api && pnpm run start:prod
```

### Environment Variables (API):

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Auto-filled by Render PostgreSQL]
JWT_SECRET=[Generate a strong secret]
REDIS_URL=[Auto-filled by Render Redis]
ALLOWED_ORIGINS=https://your-web-app.onrender.com
OPENAI_API_KEY=[Your OpenAI key]
GEMINI_API_KEY=[Your Google AI key]
```

## 🌐 Frontend Web Deployment

### Create Web Service:

```
Name: edu-ai-web
Runtime: Node
Build Command: corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile && cd apps/web && pnpm run build
Start Command: cd apps/web && pnpm run start
```

### Environment Variables (Web):

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

## 💾 Database Setup

### Create PostgreSQL Database:

```
Name: edu-ai-db
Database: edu_ai
User: postgres
```

### Create Redis Instance:

```
Name: edu-ai-redis
```

## 🚨 Common Issues & Solutions

### Issue 1: "Build failed - pnpm not found"

**Solution**: Make sure build command includes:

```bash
corepack enable && corepack prepare pnpm@latest --activate
```

### Issue 2: "Module not found" errors

**Solution**: Ensure all dependencies are in the correct package.json files

### Issue 3: "Database connection failed"

**Solution**:

1. Add `?sslmode=require` to DATABASE_URL if needed
2. Check if all migrations are applied
3. Ensure DATABASE_URL is correctly set by Render

### Issue 4: "CORS errors"

**Solution**: Set ALLOWED_ORIGINS environment variable:

```
ALLOWED_ORIGINS=https://your-web-app.onrender.com,https://your-custom-domain.com
```

### Issue 5: "Health check failed"

**Solution**: Make sure API has /health endpoint and responds correctly

## 🔍 Debugging Steps

1. **Check Build Logs**: Look for specific error messages
2. **Check Runtime Logs**: Monitor service logs for runtime errors
3. **Test Endpoints**: Use Render's shell to test API endpoints
4. **Environment Variables**: Verify all required env vars are set
5. **Database Connection**: Test database connectivity

## 📝 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection string set
- [ ] CORS origins updated for production URLs
- [ ] API keys added (OpenAI, Gemini, etc.)
- [ ] Build commands include pnpm setup
- [ ] Health check endpoint working
- [ ] Static files properly served

## 🎯 Expected URLs After Deployment

- **API**: `https://edu-ai-api.onrender.com`
- **Web**: `https://edu-ai-web.onrender.com`
- **Health**: `https://edu-ai-api.onrender.com/health`
- **API Docs**: `https://edu-ai-api.onrender.com/docs`

---

**Need help?** Check the service logs in Render dashboard for specific error messages!
