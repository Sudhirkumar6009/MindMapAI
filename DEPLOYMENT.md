# 🚀 MindMap AI - Deployment Guide

## Architecture Overview

```
┌─────────────────────┐         ┌─────────────────────┐
│   Vercel (Frontend) │ ──API──▶│  Render (Backend)   │
│   React + Vite      │         │  Node.js + Express  │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │   MongoDB Atlas     │
                                │   (Database)        │
                                └─────────────────────┘
```

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas Account** - Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
5. **Google Gemini API Key** - Get at [makersuite.google.com](https://makersuite.google.com/app/apikey)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new **FREE** cluster
3. Create a database user with password
4. Add `0.0.0.0/0` to Network Access (allows all IPs - required for Render)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/MindMapAI?retryWrites=true&w=majority
   ```

---

## 🖥️ Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mindmapai-backend`
   - **Region**: Oregon (or Singapore for Asia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`

5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (update after deploying frontend) |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
   | `JWT_EXPIRE` | `30d` |
   | `GEMINI_API_KEY` | Your Google Gemini API key |

6. Click **Create Web Service**

### Option B: Using Blueprint (render.yaml)

1. Push the `render.yaml` file to your repository
2. Go to Render Dashboard → **Blueprints**
3. Connect your repository
4. Render will auto-detect the `render.yaml`
5. Set the secret environment variables manually

### After Deployment

Copy your Render backend URL (e.g., `https://mindmapai-backend.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://mindmapai-backend.onrender.com` (your Render URL) |

6. Click **Deploy**

---

## 🔗 Step 4: Connect Frontend & Backend

### Update Render Environment Variable

After deploying frontend, go back to Render and update:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://your-app.vercel.app` (your Vercel URL) |

This enables CORS between your frontend and backend.

---

## ✅ Step 5: Verify Deployment

### Test Backend Health
```bash
curl https://mindmapai-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T...",
  "environment": "production"
}
```

### Test Frontend
1. Open your Vercel URL
2. Try to register a new account
3. Try to login
4. Create a mind map

---

## 🔧 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your exact Vercel URL
- No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`

### Database Connection Failed
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify connection string is correct
- Ensure username/password are URL-encoded if they contain special characters

### Render Service Won't Start
- Check logs in Render dashboard
- Verify all required environment variables are set
- Ensure `PORT` is set to `10000`

### API Returns 503
- Render free tier spins down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on service

---

## 📝 Environment Variables Summary

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Set to `10000` |
| `FRONTEND_URL` | Yes | Your Vercel frontend URL |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Random 64+ character string |
| `JWT_EXPIRE` | No | Token expiry (default: `30d`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Your Render backend URL |

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Push to `main`** → Both services auto-deploy
- **Preview Deployments** → Vercel creates preview URLs for PRs

---

## 💰 Cost Estimates

| Service | Free Tier | Paid Starting |
|---------|-----------|---------------|
| Vercel | Unlimited static sites | $20/mo (Pro) |
| Render | 750 hours/month, sleeps after 15min | $7/mo (always-on) |
| MongoDB Atlas | 512MB storage | $9/mo (dedicated) |
| Gemini API | Free tier available | Usage-based |

---

## 📞 Support

If you encounter issues:
1. Check the logs in Vercel/Render dashboards
2. Verify all environment variables are set correctly
3. Test the backend health endpoint directly
4. Open an issue on GitHub
