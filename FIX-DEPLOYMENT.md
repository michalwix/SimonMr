# 🔧 Fix Render Deployment

This guide helps you fix the deployment issues with your Simon Game app on Render.

## 🚀 Quick Fix

### Step 1: Get Your Service URLs

1. Go to https://dashboard.render.com
2. Find your services:
   - `simon-game-backend` (Web Service)
   - `simon-game-frontend` (Static Site)
3. Copy the URLs for each service

### Step 2: Set Frontend Environment Variables

1. Open `simon-game-frontend` service
2. Go to **Environment** tab
3. Add/Update these variables:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com
   VITE_SOCKET_URL = https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL)

4. Go to **Manual Deploy** tab
5. Click **"Clear build cache & deploy"**
6. Wait for build to complete (~2-3 minutes)

### Step 3: Set Backend Environment Variables

1. Open `simon-game-backend` service
2. Go to **Environment** tab
3. Add/Update:
   ```
   FRONTEND_URL = https://your-frontend-url.onrender.com
   ```
   (Replace with your actual frontend URL)

4. Backend will **auto-redeploy** automatically

### Step 4: Verify

1. Test backend: Open `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"ok",...}`

2. Test frontend: Open `https://your-frontend-url.onrender.com`
   - Should show the game entry page
   - Open browser console (F12) - should NOT see localhost errors

## 🎯 Auto-Detection Feature

The app now **auto-detects** the backend URL in production if:
- Frontend URL pattern: `simon-game-frontend-XXXX.onrender.com`
- Backend URL pattern: `simon-game-backend-XXXX.onrender.com`

If your services follow this naming pattern, the frontend will automatically connect to the backend **even without environment variables**!

However, **setting environment variables is still recommended** for reliability.

## 🐛 Troubleshooting

### Issue: Frontend shows localhost in console
**Fix:** Set `VITE_API_URL` and `VITE_SOCKET_URL` in frontend service environment variables, then rebuild.

### Issue: CORS errors in browser
**Fix:** Set `FRONTEND_URL` in backend service environment variables to match your frontend URL.

### Issue: Backend health check fails
**Possible causes:**
- Service is sleeping (free tier sleeps after 15 min inactivity)
- Wait ~30 seconds for cold start
- Check Render logs for errors

### Issue: WebSocket connection fails
**Fix:** 
1. Ensure `VITE_SOCKET_URL` is set in frontend
2. Ensure `FRONTEND_URL` is set in backend
3. Both should use `https://` (not `http://`)

## 📋 Environment Variables Checklist

### Frontend Service (`simon-game-frontend`)
- ✅ `VITE_API_URL` = Backend URL
- ✅ `VITE_SOCKET_URL` = Backend URL (same as above)

### Backend Service (`simon-game-backend`)
- ✅ `FRONTEND_URL` = Frontend URL
- ✅ `NODE_ENV` = `production` (auto-set)
- ✅ `JWT_SECRET` = (auto-generated)
- ✅ `PORT` = `10000` (auto-set)

## 🔄 After Fixing

Once environment variables are set:
1. Frontend will rebuild automatically
2. Backend will redeploy automatically
3. Both services will use the correct URLs
4. Your friend can use the frontend URL (not localhost!)

## 📞 Need Help?

Run the fix script:
```bash
./fix-deployment.sh
```

This will guide you through the process step by step.
