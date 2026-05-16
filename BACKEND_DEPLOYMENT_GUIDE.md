# FreightFlow: Backend Deployment Guide

**Phase:** 3.3 | **Status:** Ready for Implementation | **Target:** Production backend live by June 1, 2026

---

## 🎯 **Executive Overview**

Backend deployment brings your APIs to production, connecting the frontend to:
- User authentication & authorization
- Invoice processing
- Database operations
- Third-party integrations
- Real-time analytics

**Primary Goal:** Deploy Node.js backend to production with 99.9% uptime, auto-scaling, monitoring, and zero downtime deployments.

---

## 🔍 **Phase 1: Choose Deployment Platform (Day 1)**

### Platform Comparison

| Platform | Cost | Ease | Scaling | Best For |
|----------|------|------|---------|----------|
| **Railway** | ₹5-50/month | ⭐⭐⭐⭐⭐ | Auto | Startups, fast iteration |
| **Render** | ₹7-100/month | ⭐⭐⭐⭐ | Good | Production-ready SaaS |
| **Heroku** | $7-550/month | ⭐⭐⭐⭐ | Good | Enterprise features |
| **AWS EC2** | ₹500-5000/month | ⭐⭐ | Manual | Full control, complex |
| **DigitalOcean** | ₹250-1000/month | ⭐⭐⭐ | App Platform | Dev-friendly VPS |
| **Replit** | $0-24/month | ⭐⭐⭐⭐ | Limited | Testing, small projects |

### **RECOMMENDATION: Railway.app** ✅

Why Railway:
- ✅ Fastest setup (5 minutes)
- ✅ GitHub auto-deploy (like Netlify)
- ✅ Auto-scaling included
- ✅ MongoDB Atlas integration
- ✅ Environment variables easy setup
- ✅ PostgreSQL/MySQL included
- ✅ Logs visible in dashboard
- ✅ Affordable ($5-50/month for startups)
- ✅ Great free tier (₹0 for first 500 hours)

---

## 🚀 **Phase 2: Railway Deployment (Day 1-2)**

### Step 1: Create Railway Account

1. Visit: https://railway.app
2. Click "Start Free"
3. Sign up with GitHub
   - Click "Continue with GitHub"
   - Authorize Railway
4. Select workspace
5. Create new project

### Step 2: Deploy Backend from GitHub

**In Railway Dashboard:**

1. Click "+ New"
2. Select "GitHub Repo"
3. Choose your repo: `freightflow` or `logix`
4. Select the backend folder (if monorepo)
5. Railway auto-detects Node.js
6. Click "Deploy"

**Behind the scenes:**
```
Railway reads package.json
  ↓
Installs dependencies (npm install)
  ↓
Runs build if specified (npm run build)
  ↓
Starts server (npm start)
  ↓
Assigns URL: https://freightflow-api-prod-abc123.railway.app
```

### Step 3: Configure Environment Variables

**In Railway Dashboard:**

1. Go to Variables tab
2. Add all environment variables:

```
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/freightflow

# JWT/Auth
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRE=24h

# API Keys
GUPSHUP_API_KEY=your-gupshup-key
GUPSHUP_APP_ID=your-gupshup-app-id
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# URLs
FRONTEND_URL=https://freightflow.in
API_URL=https://api.freightflow.in

# Features
NODE_ENV=production
LOG_LEVEL=info
```

### Step 4: Set Deployment Triggers

**In Railway Settings:**

1. Auto-deploy on push: ON
2. Deploy branch: `main`
3. Auto-restart on crash: ON

---

## 🗄️ **Phase 3: Database Setup (Day 2)**

### Option A: MongoDB Atlas (Recommended for Invoice Data)

**Why MongoDB:**
- Flexible schema (invoices have varying fields)
- Easy scalability
- Good for document storage
- Free tier: 512MB storage

**Setup:**

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster:
   - Cluster name: `freightflow`
   - Cloud: AWS
   - Region: ap-south-1 (India)
   - Tier: M0 (free)
4. Create database user
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/freightflow`

**Add to Railway:**
```
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/freightflow
```

**Connection Code (backend):**
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});
```

### Option B: PostgreSQL (If Preferred)

**Setup in Railway:**

1. Railway Dashboard → "+ New"
2. Select "PostgreSQL"
3. Railway provisions PostgreSQL automatically
4. Connection string auto-added to variables

**Connection Code:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});
```

---

## 🔐 **Phase 4: Security Configuration (Day 2-3)**

### Step 1: Environment Variables Protection

**Never commit sensitive data!**

**Good ✅:**
```javascript
// Use environment variables
const apiKey = process.env.API_KEY;
const jwtSecret = process.env.JWT_SECRET;
```

**Bad ❌:**
```javascript
// Hard-coded secrets
const apiKey = "ak_live_1234567890";
const jwtSecret = "my-super-secret-key";
```

### Step 2: CORS Configuration

**In backend code:**
```javascript
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 3: Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later'
});

app.post('/auth/login', authLimiter, (req, res) => {
  // Login logic
});
```

### Step 4: HTTPS & TLS

**Railway automatically:**
- Provides HTTPS
- Manages SSL certificates
- Redirects HTTP → HTTPS

**No configuration needed!**

### Step 5: API Authentication

**JWT-based auth:**

```javascript
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Protected endpoint
app.get('/api/invoices', verifyToken, (req, res) => {
  // Only logged-in users can access
  res.json({ invoices: [] });
});
```

---

## 🔄 **Phase 5: API Integration (Day 3)**

### Step 1: Update Frontend API URL

**In frontend code:**
```javascript
// OLD (local development)
const API_URL = 'http://localhost:5000';

// NEW (production)
const API_URL = process.env.REACT_APP_API_URL || 'https://api.freightflow.in';

// Fetch call
fetch(`${API_URL}/api/invoices`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**In Netlify environment variables:**
```
REACT_APP_API_URL=https://api.freightflow.in
```

### Step 2: Custom Domain for Backend API

**Option 1: Railway Custom Domain (Recommended)**

In Railway Dashboard:
1. Settings → Domain
2. Click "Add Custom Domain"
3. Enter: `api.freightflow.in`
4. Update DNS at domain registrar

**At Domain Registrar:**
```
Create CNAME record:
Type: CNAME
Name: api
Value: <railway-domain>.railway.app
```

**Option 2: Subdomain Redirect**
```
Create A record pointing to Railway IP
Or CNAME to Railway domain
```

### Step 3: API Health Check

**Add health endpoint:**
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongooseConnection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

**Railway will use this to:**
- Monitor uptime
- Auto-restart if unhealthy
- Show status in dashboard

**Test it:**
```bash
curl https://api.freightflow.in/api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-05-27T10:30:45.123Z",
  "uptime": 12345.67,
  "database": "connected"
}
```

---

## 📊 **Phase 6: Monitoring & Logging (Day 4)**

### Step 1: Structured Logging

**Use winston for better logs:**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Server started', { port: 5000 });
logger.error('Database connection failed', { error: err.message });
logger.warn('High memory usage detected', { memory: process.memoryUsage() });
```

### Step 2: Error Tracking with Sentry

**Setup Sentry (free tier available):**

1. Visit: https://sentry.io
2. Sign up (free)
3. Create project: Node.js
4. Get DSN: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

**Add to Railway environment variables:**
```
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**In backend code:**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

// Your routes here

app.use(Sentry.Handlers.errorHandler());
```

**Benefits:**
- ✅ Real-time error alerts
- ✅ Stack traces
- ✅ User session replay
- ✅ Performance monitoring

### Step 3: Performance Monitoring

**In Railway Dashboard:**

- Memory usage
- CPU usage
- Response time
- Error rate

**View logs:**
```
Railway → Logs tab → See real-time server logs
```

### Step 4: Create Alerts

**In Railway:**

1. Settings → Alerts
2. Create alert for:
   - CPU > 80%
   - Memory > 85%
   - Deployment failed
   - Service crashed

**In Sentry:**

1. Project settings → Alerts
2. Create alert for:
   - New issue
   - Error threshold exceeded
3. Send to Slack/Email

---

## 🧪 **Phase 7: Testing Backend (Day 4-5)**

### Step 1: Smoke Test (Critical Paths)

```bash
# Test health check
curl https://api.freightflow.in/api/health
# Expected: 200 OK

# Test login
curl -X POST https://api.freightflow.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@freightflow.in","password":"password123"}'
# Expected: 200 OK + token

# Test with invalid credentials
curl -X POST https://api.freightflow.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@freightflow.in","password":"wrong"}'
# Expected: 401 Unauthorized

# Test protected endpoint
curl https://api.freightflow.in/api/invoices \
  -H "Authorization: Bearer <your-token>"
# Expected: 200 OK + invoice data
```

### Step 2: Load Testing

**Using Apache Bench:**

```bash
# Simple load test
ab -n 1000 -c 10 https://api.freightflow.in/api/health

# Results:
# Requests per second: 100+ (good)
# Response time: <100ms (good)
# Failed requests: 0 (good)
```

### Step 3: Database Testing

```javascript
// Test database connection
const testDbConnection = async () => {
  try {
    const result = await Invoice.count();
    console.log(`✅ Database connected. Total invoices: ${result}`);
  } catch (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }
};

testDbConnection();
```

### Step 4: API Integration Testing

**Test frontend → backend flow:**

```javascript
// Frontend code
const testApiIntegration = async () => {
  try {
    // 1. Login
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@freightflow.in',
        password: 'password123'
      })
    });
    const { token } = await loginRes.json();
    console.log('✅ Login successful');

    // 2. Fetch invoices
    const invoiceRes = await fetch(`${API_URL}/api/invoices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { invoices } = await invoiceRes.json();
    console.log(`✅ Fetched ${invoices.length} invoices`);

    // 3. Process invoice
    const processRes = await fetch(`${API_URL}/api/invoices/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        invoiceId: invoices[0]._id,
        imageData: 'base64-encoded-image'
      })
    });
    const { result } = await processRes.json();
    console.log('✅ Invoice processed:', result);
  } catch (err) {
    console.error('❌ Integration test failed:', err);
  }
};
```

---

## 🔄 **Phase 8: Continuous Deployment Setup (Day 5)**

### How It Works

```
Developer pushes to main branch
         ↓
GitHub sends webhook to Railway
         ↓
Railway pulls code
         ↓
Installs dependencies (npm install)
         ↓
Runs build if specified
         ↓
Starts new instance
         ↓
Health checks pass?
         ↓
YES → Route traffic to new instance
      Old instance shuts down gracefully
      
NO  → New instance fails
      Old instance stays live
      Developer notified of failure
```

### Setup Continuous Deployment

**In Railway Dashboard:**

1. Settings → Deploy
2. Auto-deploy: ON
3. Deploy on main push: YES
4. Deployment strategy: Rolling (zero downtime)

### Deployment Monitoring

**Watch deployment:**
1. Go to Railway Deployments tab
2. See real-time build logs
3. When complete, check health endpoint

---

## 📈 **Phase 9: Auto-Scaling (Day 5)**

### Railway Auto-Scaling

**Configuration (in railway.toml or UI):**

```toml
[deploy]
# Scale up if CPU > 80%
# Scale down if CPU < 20%
# Max instances: 5
# Min instances: 1
```

**Or in Railway UI:**
1. Settings → Auto-Scaling
2. Enable: YES
3. Min instances: 1
4. Max instances: 5
5. CPU threshold: 80%

### Database Auto-Scaling

**MongoDB Atlas:**
1. Auto-scaling: Enabled by default
2. Increases storage as needed
3. Pay for what you use

**PostgreSQL on Railway:**
1. Auto-scaling: Available
2. Scales compute if needed

---

## 🎯 **Phase 10: Pre-Launch Checklist (Day 6)**

### Backend Checklist

**Deployment:**
- [ ] Code pushed to GitHub main branch
- [ ] Railway connected to GitHub repo
- [ ] Build succeeds (check Deployment tab)
- [ ] Server starts without errors (check Logs)
- [ ] No pending environment variables

**Database:**
- [ ] Database credentials configured
- [ ] Connection string in Railway variables
- [ ] Database created and accessible
- [ ] Test data imported (optional but useful)

**API Security:**
- [ ] CORS configured correctly
- [ ] JWT tokens working
- [ ] Rate limiting enabled
- [ ] Environment variables not exposed
- [ ] HTTPS enforced

**Health & Monitoring:**
- [ ] Health check endpoint responding
- [ ] Logs visible in Railway dashboard
- [ ] Error tracking (Sentry) configured
- [ ] Alerts configured (CPU, memory, errors)
- [ ] Custom domain working (api.freightflow.in)

**API Testing:**
- [ ] Health check responds (200 OK)
- [ ] Login works
- [ ] Protected endpoints require auth
- [ ] Invalid tokens rejected
- [ ] Database queries working
- [ ] All core endpoints tested

**Frontend Integration:**
- [ ] Frontend environment variables point to production API
- [ ] Frontend deployed to Netlify
- [ ] Frontend can authenticate with backend
- [ ] API calls working end-to-end
- [ ] Session persistence working

**Documentation:**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Error codes documented
- [ ] Deployment guide for team
- [ ] Monitoring dashboard link saved
- [ ] Incident response plan created

---

## 🚀 **Phase 11: Launch (Day 7)**

### Launch Sequence

**1 Hour Before:**
- [ ] Final smoke tests
- [ ] Monitor dashboard is clean
- [ ] No pending deployments
- [ ] Team on standby

**Go Live:**
- [ ] Push final changes to GitHub
- [ ] Watch Railway deployment (< 2 minutes)
- [ ] Test health endpoint
- [ ] Test authentication
- [ ] Test API integration with frontend

**First 30 Minutes:**
- [ ] Monitor error rate (target: 0%)
- [ ] Monitor response time (target: <200ms)
- [ ] Monitor CPU usage (target: <50%)
- [ ] Check logs for any issues
- [ ] Have rollback plan ready

**First Hour:**
- [ ] Monitor uptime
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Celebrate! 🎉

### Rollback Plan

**If critical issue found:**

1. Stop traffic to new instance
2. Revert to previous Railway deployment
3. Investigate and fix
4. Re-deploy

**How to rollback in Railway:**
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Redeploy"
4. Confirms with team
5. Previous version goes live (< 1 minute)

---

## 📊 **Success Metrics**

| Metric | Target | Status |
|--------|--------|--------|
| API uptime | 99.9%+ | — |
| Response time | <200ms | — |
| Error rate | <0.1% | — |
| CPU usage | <70% | — |
| Memory usage | <80% | — |
| Health check | 200 OK | — |
| Deployment time | <2 min | — |

---

## 🛠️ **Troubleshooting**

### Deployment Fails

**Solution:**
1. Check Railway Deployment logs
2. Look for specific error
3. Common issues:
   - Missing environment variable
   - package.json start script incorrect
   - Port conflict
4. Fix locally, push to GitHub
5. Railway re-deploys automatically

### API Returns 500 Error

**Solution:**
1. Check Railway Logs tab for error
2. Check Sentry dashboard for stack trace
3. Common issues:
   - Database connection failed
   - Missing environment variable
   - Logic error in code
4. Fix and push to GitHub

### Slow Response Times

**Solution:**
1. Check Railway performance metrics
2. Check database query performance
3. Enable Redis caching if needed
4. Optimize N+1 queries
5. Add database indexes

### Database Connection Issues

**Solution:**
1. Verify DATABASE_URL is correct
2. Check database password (special chars need escaping)
3. Verify database IP whitelist (if applicable)
4. Test connection locally first
5. Check database service is running

---

## 📚 **Resources**

**Deployment:**
- Railway docs: https://docs.railway.app
- Node.js best practices: https://nodejs.org/en/docs/
- Express deployment: https://expressjs.com/en/advanced/best-practice-performance.html

**Monitoring:**
- Sentry docs: https://docs.sentry.io
- Winston logger: https://github.com/winstonjs/winston

**Databases:**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- PostgreSQL: https://www.postgresql.org/docs/

**Testing:**
- Postman: https://www.postman.com (API testing)
- Jest: https://jestjs.io (unit testing)

---

## ✅ **Implementation Checklist**

**Day 1: Railway Setup**
- [ ] Create Railway account
- [ ] Connect GitHub repo
- [ ] Deploy backend
- [ ] Verify deployment succeeded

**Day 2: Environment & Database**
- [ ] Add all environment variables
- [ ] Set up MongoDB Atlas or PostgreSQL
- [ ] Test database connection
- [ ] Import test data

**Day 3: Security**
- [ ] Configure CORS
- [ ] Set up JWT authentication
- [ ] Add rate limiting
- [ ] Verify HTTPS working

**Day 4: Integration & Monitoring**
- [ ] Update frontend API URL
- [ ] Set up custom domain
- [ ] Configure Sentry error tracking
- [ ] Set up structured logging

**Day 5: Testing**
- [ ] Run smoke tests
- [ ] Load testing
- [ ] API integration testing
- [ ] Database performance testing

**Day 6: Pre-Launch**
- [ ] Final health checks
- [ ] All endpoints tested
- [ ] Frontend integration verified
- [ ] Alerts configured
- [ ] Runbook created

**Day 7: Launch**
- [ ] Final checks
- [ ] Monitor deployment
- [ ] Verify all systems
- [ ] Ready for traffic!

---

**Owner:** Ganesh Kumar  
**Duration:** 7 days (Phase 3.3)  
**Status:** Ready for Launch  
**Target Date:** June 1, 2026 (Sunday)  
**Last Updated:** May 15, 2026

---

## 🎯 **Next Steps**

1. ✅ Deploy frontend to Netlify
2. ✅ Deploy backend to Railway (THIS TASK)
3. ➡️ Configure environment variables & integrations
4. ➡️ Setup database backups
5. ➡️ Implement comprehensive monitoring
6. ➡️ Setup error tracking & incident response
7. ➡️ Run full QA test suite
8. ➡️ Launch & celebrate! 🚀
