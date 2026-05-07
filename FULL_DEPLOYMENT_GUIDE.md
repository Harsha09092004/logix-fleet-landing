# 🚀 Full Deployment Guide: Backend + Frontend

**Timeline:** ~30-45 minutes for complete setup
**Difficulty:** Easy - just following steps

---

## 📋 Overview

You'll complete this in 4 main steps:
1. ✅ Set up MongoDB Atlas (cloud database)
2. ✅ Deploy backend to Railway
3. ✅ Update frontend API endpoints
4. ✅ Deploy frontend to Netlify

After this, your app will be **fully live** with both frontend and backend working.

---

## STEP 1: Set Up MongoDB Atlas (Cloud Database)

Your backend needs a MongoDB database. We'll use MongoDB Atlas (free tier available).

### 1A: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** or **"Sign Up"**
3. Create account with email/password
4. Verify your email

### 1B: Create a Free Cluster
1. Click **"Create"** under "Deployments"
2. Choose **"Free"** tier
3. Select region (choose closest to your users, e.g., `US East`)
4. Click **"Create Deployment"**
5. Wait 2-3 minutes for cluster to be ready

### 1C: Get Your Connection String
1. In Atlas, click **"Connect"** on your cluster
2. Click **"Connect your application"**
3. Choose **"Node.js"** and version **3.6+**
4. Copy the connection string: `mongodb+srv://username:password@...`
5. **Replace:**
   - `<username>` → Your Atlas username
   - `<password>` → Your Atlas password
6. **Copy this entire string** - you'll need it in Step 2

### 1D: Create Network Access
1. Go to **"Network Access"** tab
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Railway deployment)
4. Confirm

✅ **MongoDB Atlas is ready!**

---

## STEP 2: Deploy Backend to Render

Render is perfect for Node.js apps - simple, fast, and free tier available.

### 2A: Create Render Account
1. Go to https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign in with **GitHub** (easiest) or email
4. Create account

### 2B: Deploy from Your GitHub Repo
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Authorize Render to access GitHub
4. **Select your repository** from the list
   - If not listed, click "Configure GitHub App" and grant access
5. Fill in details:
   - **Name:** `freightflow-backend` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/server.js`
   - **Region:** Select closest to your users
6. Click **"Create Web Service"**
7. Wait for deployment to complete (~3-5 minutes)

### 2C: Add Environment Variables to Render
Once deployed, you need to add your environment variables:

1. In Render dashboard, click your service
2. Go to **"Environment"** tab
3. Add each variable (click **"Add Environment Variable"**):

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string from Step 1C |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Will update after Netlify deployment |
| `JWT_SECRET` | `your-super-secret-key-change-this` |
| `EMAIL_PROVIDER` | `gmail` (or your choice) |
| `EMAIL_USER` | Your email address |
| `EMAIL_PASSWORD` | Gmail app password (see below) |
| `EMAIL_FROM` | Your email address |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID (if using WhatsApp) |
| `TWILIO_AUTH_TOKEN` | Your Twilio token (if using WhatsApp) |
| `TWILIO_PHONE` | Your Twilio phone (if using WhatsApp) |

**Gmail App Password Setup (if using Gmail for emails):**
1. Go to https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Windows Computer"**
3. Google generates a 16-character password
4. Copy it and paste into Railway's `EMAIL_PASSWORD`

### 2D: Get Your Backend URL
1. In Render dashboard, click your service
2. At the top, you'll see a URL like: `https://freightflow-backend-xxxx.onrender.com`
3. **Copy this URL** - you'll need it in Step 3

✅ **Backend is live!**

---

## STEP 3: Update Frontend API Endpoints

Your frontend needs to know where to find the backend (currently points to localhost).

### 3A: Find All API Calls
Search your HTML files for `http://localhost:5000` or `fetch`:

Common files to update:
- `index.html`
- `logix-landing-page.html`
- `landing_beta.html`
- `js/` folder files

### 3B: Replace Localhost with Backend URL
Replace all occurrences:
- **Old:** `http://localhost:5000/api/...`
- **New:** `https://your-railway-url.railway.app/api/...`

Example:
```javascript
// BEFORE
const response = await fetch('http://localhost:5000/api/ocr/upload', {

// AFTER
const response = await fetch('https://freightflow-prod-xxxx.railway.app/api/ocr/upload', {
```

### 3C: Update FRONTEND_URL in Render
Now update the backend to know your frontend URL:

1. Go to Render dashboard
2. Click your service → **Environment** tab
3. Update `FRONTEND_URL` to your Netlify URL (you'll get it in Step 4)
   - Format: `https://your-site.netlify.app`
4. Click **"Save Changes"** - this will redeploy automatically

✅ **Frontend is configured!**

---

## STEP 4: Deploy Frontend to Netlify

### 4A: Prepare Files for Deployment
Make sure you've updated all API endpoints in Step 3.

### 4B: Create Netlify Site
1. Go to https://netlify.com
2. Log in (or sign up with GitHub)
3. Click **"Add new site"** → **"Deploy manually"**
4. **Drag and drop your entire Logix folder** onto Netlify
   - Or click to browse and select the folder
5. Netlify will upload and deploy automatically (~1 minute)

### 4C: Netlify Will Show Your URL
After deployment, you'll see: `https://xxx-yyy-zzz.netlify.app`

**This is your live frontend!**

### 4D: Update Backend's FRONTEND_URL
Now ender dashboard → Your service → **Environment**
2. Set `FRONTEND_URL` to your Netlify URL
3. Click **"Save Changes"** (Render your Netlify URL
3. **Redeploy** (Railway will auto-redeploy)

✅ **Everything is live!**

---

## 🧪 Testing Your Deployment

### Test Backend
Open in browser or terminal:
```
https://your-render-url.onrender.com/
```
Should show your `index.html`

### Test Frontend
Open in browser:
```
https://your-netlify-url.netlify.app
```
Should load and work normally

### Test API Calls
Try an API endpoint from your browser:
```
https://your-render-url.onrender.com/api/email/status
```
Should return JSON response

---

## 🔄 Future Deployments

### Backend Updates
1. Push changes to GitHub
2. Render auto-deploys when it detects changes (within 2-5 minutes)
   - Optional: Enable auto-deploy in Render dashboard → **Settings** → **Auto-Deploy**

### Frontend Updates
1. Update your local files
2. Drag & drop updated folder to Netlify
3. Or connect GitHub repo to Netlify for auto-deployments

---

## ⚠️ Troubleshooting

### Backend Not Responding
- Check Mender deployment logs (Render dashboard → **Logs**)
- Verify environment variables are set in Render
- Verify environment variables are set

### Frontend Can't Connect to Backend
- Check CORS is enabled in backend
- Verify API endpoint URLs are correct
- Check browser console for errors

### MongoDB Connection Error
- Verify connection string is correct
- Ensure MongoDB Atlas network access includes Railway IPs (done in Step 1D)
- Check username/password in connection string

---

## 📊 Your Final Setup

| Component | Status | URL |
|-----------|--------|-----|
| Database | ender | `https://your-render-url.onrender.com
| Backend | Railway | `https://your-railway-url.railway.app` |
| Frontend | Netlify | `https://your-netlify-url.netlify.app` |

---

## 📝 Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and connection string copied
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Environment variables added to Railway
- [ ] Railway backend URL copied
- [ ] Frontend API endpoints updated
- [ ] Frontend deployed to Netlify
- [ ] Netlify URL copied
- [ ] FRONTEND_URL updated in Railway
- [ ] Tested backend API
- [ ] Tested frontend loading
- [ ] Tested API calls from frontend

---

**You're done!** Your app is live and ready for users! 🎉
