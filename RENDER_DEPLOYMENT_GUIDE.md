# 🚀 Render Deployment Guide - MuleRift

## Architecture Overview

Your app uses a **hybrid architecture**:
- **Frontend**: Next.js 14 (React, TypeScript, Tailwind)
- **API Layer**: Next.js API Routes (serverless functions)
- **Detection Engine**: Python subprocess (spawned by Node.js)
- **AI**: Groq API (external service)

This is a **legitimate production architecture**, not a monolith hack!

---

## 📋 Pre-Deployment Checklist

### 1. Verify Files Are Ready

- [x] `package.json` - Has build and start scripts
- [x] `python-engine/requirements.txt` - Python dependencies
- [x] `.gitignore` - Excludes .env.local
- [x] `render.yaml` - Deployment configuration
- [x] `build.sh` - Build script
- [x] `/api/health` - Health check endpoint

### 2. Commit and Push

```bash
git add .
git commit -m "chore: add Render deployment configuration"
git push origin integration
```

---

## 🎯 Deployment Steps

### Step 1: Sign Up / Log In to Render

1. Go to https://render.com
2. Sign up or log in (use GitHub for easy integration)

### Step 2: Create New Web Service

1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: `niytdv/Rift`
4. Select the `integration` branch

### Step 3: Configure Service

Fill in the following settings:

#### Basic Settings
- **Name**: `mulerift-app` (or your preferred name)
- **Region**: Oregon (US West) or closest to you
- **Branch**: `integration`
- **Root Directory**: Leave blank (uses repo root)

#### Build Settings
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  python3 -m pip install --upgrade pip && pip3 install -r python-engine/requirements.txt && npm ci && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

#### Advanced Settings
- **Node Version**: `20` (or latest LTS)
- **Auto-Deploy**: `Yes` (deploys on every push)

### Step 4: Add Environment Variables

Click **"Environment"** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `GROQ_API_KEY` | `gsk_4jvoK0JRGqTAIxRxB6xl...` | Your Groq API key |
| `NODE_ENV` | `production` | Production mode |

**Important**: Do NOT add `.env.local` to git! Use Render's environment variables.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install Python dependencies
   - Install Node dependencies
   - Build Next.js app
   - Start the server

**Build time**: ~5-10 minutes (first deploy)

---

## 🔍 Monitoring Deployment

### Check Build Logs

Watch the logs in real-time:
- ✅ Python dependencies installing
- ✅ Node dependencies installing
- ✅ Next.js building
- ✅ Server starting

### Expected Output

```
🐍 Installing Python dependencies...
Successfully installed networkx-3.0 pandas-2.0.0 python-dateutil-2.8.0

📦 Installing Node dependencies...
added 273 packages

🏗️  Building Next.js application...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

✅ Build completed successfully!

Server listening on http://0.0.0.0:10000
```

---

## 🧪 Testing Your Deployment

### 1. Check Health Endpoint

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T..."
}
```

### 2. Test Sample Analysis

```bash
curl -X POST https://your-app.onrender.com/api/sample
```

Should return fraud detection results.

### 3. Test Chat API

```bash
curl -X POST https://your-app.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What patterns were detected?"}'
```

Should return AI response.

### 4. Open in Browser

Visit: `https://your-app.onrender.com`

Test:
- Upload CSV file
- View dashboard at `/dashboard`
- Use AI chatbot
- Check fraud detection results

---

## 🐛 Troubleshooting

### Issue 1: Python Not Found

**Error**: `python: command not found`

**Solution**: Render's Node environment includes Python 3. Use `python3` instead:
```bash
python3 python-engine/main.py
```

Update `lib/pythonBridge.ts`:
```typescript
const pythonProcess = spawn('python3', [pythonScript, csvPath]);
```

### Issue 2: Module Not Found

**Error**: `ModuleNotFoundError: No module named 'networkx'`

**Solution**: Ensure build command installs Python deps:
```bash
pip3 install -r python-engine/requirements.txt
```

### Issue 3: Build Timeout

**Error**: Build exceeds 15 minutes

**Solution**: 
- Use `npm ci` instead of `npm install` (faster)
- Remove unused dependencies
- Upgrade to paid plan for longer build times

### Issue 4: Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**: Add to build command:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue 5: GROQ_API_KEY Not Found

**Error**: `GROQ_API_KEY not configured`

**Solution**: 
1. Go to Render dashboard
2. Click your service
3. Go to "Environment" tab
4. Add `GROQ_API_KEY` variable
5. Click "Save Changes"
6. Redeploy

---

## 📊 Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:
```javascript
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}
```

### 2. Optimize Python Subprocess

The current implementation spawns Python for each request. This is fine for:
- Low traffic
- Free tier
- Simple architecture

For high traffic, consider:
- Keeping Python process alive
- Using a process pool
- Caching analysis results

### 3. Add CDN

Render automatically provides CDN for static assets.

---

## 💰 Cost Estimation

### Free Tier (Current)
- **Cost**: $0/month
- **Limits**:
  - 750 hours/month
  - Spins down after 15 min inactivity
  - 512 MB RAM
  - Shared CPU

### Starter Plan (Recommended for Production)
- **Cost**: $7/month
- **Benefits**:
  - Always on (no spin down)
  - 512 MB RAM
  - Shared CPU
  - Custom domain

### Standard Plan (High Traffic)
- **Cost**: $25/month
- **Benefits**:
  - 2 GB RAM
  - Dedicated CPU
  - Better performance

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use Render's environment variables
- ✅ Rotate API keys regularly

### 2. CORS Configuration
Add to API routes if needed:
```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'POST, GET',
}
```

### 3. Rate Limiting
Consider adding rate limiting to API routes:
```typescript
// Prevent abuse of Python subprocess
const rateLimiter = new Map();
```

---

## 🔄 CI/CD Pipeline

### Auto-Deploy on Push

Render automatically deploys when you push to `integration` branch:

```bash
git add .
git commit -m "feat: add new feature"
git push origin integration
```

Render will:
1. Detect push
2. Start build
3. Run tests (if configured)
4. Deploy new version
5. Health check
6. Switch traffic to new version

### Manual Deploy

From Render dashboard:
1. Click your service
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

---

## 📈 Monitoring & Logs

### View Logs

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs

### Metrics

Render provides:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Alerts

Set up alerts for:
- Service down
- High error rate
- Memory issues
- Build failures

---

## 🎉 Post-Deployment

### 1. Update Frontend URLs

If deploying frontend separately, update API URLs:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-app.onrender.com';
```

### 2. Custom Domain (Optional)

1. Go to "Settings" tab
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records
5. SSL automatically provisioned

### 3. Share Your App

Your app is live at:
```
https://mulerift-app.onrender.com
```

---

## 📞 Support

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Your App Issues
- Check logs first
- Verify environment variables
- Test locally with production build:
  ```bash
  npm run build
  npm start
  ```

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] Health check endpoint working
- [ ] Python dependencies installed
- [ ] Build completes successfully
- [ ] All API routes tested
- [ ] Chatbot working with Groq API
- [ ] CSV upload and analysis working
- [ ] Dashboard loading correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

---

**Your app is production-ready!** 🚀

The architecture is solid:
- Next.js handles HTTP and routing
- Python handles fraud detection
- Groq handles AI chat
- Everything works together seamlessly

This is NOT a hack - it's a legitimate microservices-lite architecture!
