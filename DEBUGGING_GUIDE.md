# BrandLens Debugging & Monitoring Guide

## Overview
A comprehensive debugging and monitoring system has been implemented for BrandLens to track API connectivity, data exchange, and system health in real-time.

## 🛠️ New Debugging Tools

### 1. System Diagnostics Page
**URL**: http://localhost:3000/debug

A comprehensive dashboard showing:
- **Overall System Status**: Health indicator with response times
- **API Activity Stats**: Total requests, recent activity, error counts
- **System Information**: Node.js version, memory usage, uptime
- **Health Checks**:
  - Database connectivity and response time
  - Environment variables status (required & optional)
  - API endpoint availability
- **Recent API Calls**: Live log of all API requests with:
  - Timestamp
  - HTTP method and URL
  - Response status codes
  - Response duration
- **Auto-refresh**: Updates every 5 seconds (can be toggled)

### 2. API Health Check Endpoint
**URL**: http://localhost:3000/api/health

Returns JSON health status including:
```json
{
  "timestamp": "2025-10-31T20:XX:XX.XXX",
  "status": "healthy|unhealthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "responseTime": "5ms"
    },
    "environment": {
      "status": "healthy",
      "required": {
        "DATABASE_URL": true
      },
      "optional": {
        "OPENAI_API_KEY": false,
        "ANTHROPIC_API_KEY": false,
        "GOOGLE_AI_API_KEY": false
      }
    },
    "api": {
      "status": "healthy",
      "endpoints": {
        "/api/projects": "available",
        "/api/health": "available"
      }
    }
  },
  "system": {
    "nodeVersion": "v20.x.x",
    "platform": "darwin",
    "uptime": "XXXs",
    "memory": {
      "used": "XXmb",
      "total": "XXmb"
    }
  },
  "responseTime": "XXms"
}
```

### 3. API Request Logs
**URL**: http://localhost:3000/api/debug/logs

Query parameters:
- `limit` - Number of logs to return (default: 50)
- `stats=true` - Include statistics

Returns:
```json
{
  "logs": [
    {
      "id": "unique-id",
      "timestamp": "2025-10-31T20:XX:XX.XXX",
      "method": "POST",
      "url": "/api/projects",
      "status": 200,
      "duration": 150,
      "error": null
    }
  ],
  "stats": {
    "total": 100,
    "last5Minutes": 5,
    "errors": 2,
    "averageDuration": 125.5,
    "byStatus": {
      "200": 95,
      "400": 3,
      "500": 2
    }
  }
}
```

## 🔍 Current System Status

### ✅ Working
- Database connection (Prisma Postgres running on ports 51213-51215)
- API endpoints responding
- Health check system
- Logging infrastructure
- PM2 process management
- Email capture form
- URL normalization (accepts domains with/without https://)

### ⚠️ Issues Detected
From the logs, the current issue is:
```
Error: OPENAI_API_KEY is required
```

**Root Cause**: Missing LLM API keys in environment variables

**Required Environment Variables** (currently missing):
- `OPENAI_API_KEY` - For OpenAI GPT models
- `ANTHROPIC_API_KEY` - For Claude models
- `GOOGLE_AI_API_KEY` - For Google Gemini models

## 🔧 How to Use the Debugging Tools

### When an Error Occurs:

1. **Check the Error Page**
   - Error pages now include:
     - Detailed error message
     - Possible causes list
     - "View System Diagnostics" button
     - "Check API Health" button

2. **View System Diagnostics** (`/debug`)
   - See overall system health
   - Check database connectivity
   - Verify environment variables
   - Review recent API call logs
   - Monitor error rates

3. **Check API Health** (`/api/health`)
   - Quick JSON health status
   - Database connectivity test
   - Environment variable checks
   - Response time metrics

4. **Review PM2 Logs**
   ```bash
   pm2 logs brandlens
   pm2 logs brandlens --lines 100
   pm2 logs brandlens --nostream  # Don't follow
   ```

## 📊 Enhanced API Logging

All API routes now include:
- Detailed console logging with `[API]` prefix
- Request body logging (in development)
- Database connection testing before queries
- Stack traces on errors (in development)
- Response time tracking
- Error categorization (validation vs. server errors)

### Example API Log Output:
```
[API] POST /api/projects - Request body: {
  "url": "https://example.com",
  "email": "user@example.com",
  "region": "Austin, TX"
}
[API] Validated data: { ... }
[API] Database connection: OK
[API] Creating project in database...
[API] Project created: cltxxx123
```

## 🚨 Error Tracking

Errors are now logged with:
- Error message
- Stack trace (in development)
- Request context
- Timing information
- Categorization (400 validation, 500 server)

### Error Response Format:
```json
{
  "error": "Failed to create project",
  "message": "Database connection failed: ...",
  "details": "... stack trace ..." // only in development
}
```

## 🎯 Quick Troubleshooting

### Issue: "Analysis failed. Please try again."
**Steps:**
1. Go to `/debug` page
2. Check "Environment Variables" section
3. Verify required API keys are set:
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY
   - GOOGLE_AI_API_KEY
4. Add missing keys to `.env` file
5. Restart PM2: `pm2 restart brandlens`

### Issue: "Database connection failed"
**Steps:**
1. Check if Prisma dev server is running: `lsof -i:51213`
2. If not running: `npx prisma dev`
3. Verify DATABASE_URL in `.env`
4. Check `/api/health` for database status

### Issue: "Cannot fetch data from service"
**Steps:**
1. Check PM2 logs: `pm2 logs brandlens`
2. Verify Prisma Postgres is running
3. Check database migrations: `npx prisma db push`
4. Regenerate Prisma client: `npx prisma generate`

## 📁 New Files Created

### API & Backend
- `/app/api/health/route.ts` - Health check endpoint
- `/app/api/debug/logs/route.ts` - API request logs endpoint
- `/lib/debug/api-logger.ts` - API logging utility

### Frontend
- `/app/debug/page.tsx` - System diagnostics dashboard

### Documentation
- `/DEBUGGING_GUIDE.md` - This file
- `/STRATEGY_EMAIL_AUTH.md` - Email & authentication strategy

### Modified Files
- `/app/api/projects/route.ts` - Enhanced with detailed logging
- `/app/project/[id]/page.tsx` - Improved error display with debug links
- `/app/page.tsx` - Added email field and URL normalization

## 🔐 Setting Up API Keys

1. Create/update `.env` file in project root:
```env
# Database
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

# LLM API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."

# Optional: Email Services (for Phase 2)
RESEND_API_KEY="re_..."
MAILERLITE_API_KEY="..."
```

2. Restart the server:
```bash
pm2 restart brandlens
```

3. Verify in `/debug` that all keys show as "✓ Set"

## 🎨 Debug Page Features

### Real-time Monitoring
- Auto-refreshes every 5 seconds
- Can toggle auto-refresh on/off
- Shows last update timestamp

### Status Indicators
- 🟢 Green = Healthy/Available
- 🔴 Red = Unhealthy/Error
- 🟡 Yellow = Warning

### Action Buttons
- **Clear Logs**: Removes all API request logs
- **Try Again**: Return to home page
- **View System Diagnostics**: Open debug dashboard
- **Check API Health**: View JSON health status

## 🚀 Next Steps for Production

1. **Add Authentication**: Protect `/debug` endpoint in production
2. **Persistent Logging**: Store logs in database or external service
3. **Alerts**: Set up notifications for errors/downtime
4. **Metrics**: Add Prometheus/Grafana for long-term monitoring
5. **Error Tracking**: Integrate Sentry or similar service
6. **Performance**: Add response time tracking and alerting

## 📞 Support & Troubleshooting

For issues not covered here:
1. Check `/debug` page for system status
2. Review `/api/health` for health checks
3. Check PM2 logs: `pm2 logs brandlens --lines 100`
4. Verify Prisma database: `npx prisma studio`
5. Test database connection: `npx prisma db push`

## 🎯 Summary

You now have a complete debugging infrastructure that provides:
- ✅ Real-time system health monitoring
- ✅ API request/response tracking
- ✅ Database connectivity checks
- ✅ Environment variable validation
- ✅ Error logging with stack traces
- ✅ Performance metrics (response times)
- ✅ User-friendly error pages with debug links

All debugging tools are accessible at:
- **Dashboard**: http://localhost:3000/debug
- **Health API**: http://localhost:3000/api/health
- **Logs API**: http://localhost:3000/api/debug/logs

Happy debugging! 🐛🔍
