# FreightFlow: Environment Configuration & Setup Guide

**Phase:** 3.4 | **Status:** Ready for Implementation | **Target:** Full setup by June 2, 2026

---

## 🎯 **Executive Overview**

Environment configuration connects all your services:
- Frontend (Netlify)
- Backend API (Railway)
- Database (MongoDB/PostgreSQL)
- Third-party services (Email, analytics, error tracking)
- Payment processing (if applicable)

**Primary Goal:** Establish complete production infrastructure with all services communicating securely and reliably.

---

## 📋 **Phase 1: Environment Variables Audit (Day 1)**

### Frontend Environment Variables (Netlify)

```env
# API Configuration
REACT_APP_API_URL=https://api.freightflow.in
REACT_APP_API_TIMEOUT=30000

# Analytics
REACT_APP_GA_ID=G-XXXXXXXXXX
REACT_APP_HOTJAR_ID=1234567

# Error Tracking
REACT_APP_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Feature Flags
REACT_APP_FEATURE_VIDEO=true
REACT_APP_FEATURE_DEMO=true
REACT_APP_FEATURE_PRICING=true
REACT_APP_FEATURE_REFERRAL=true

# URLs
REACT_APP_LANDING_URL=https://freightflow.in
REACT_APP_BLOG_URL=https://blog.freightflow.in
REACT_APP_DOCS_URL=https://docs.freightflow.in

# Build
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false
```

### Backend Environment Variables (Railway)

```env
# Server Configuration
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/freightflow
DB_POOL_SIZE=20
DB_TIMEOUT=30000

# JWT & Auth
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=another-long-random-secret-key
JWT_REFRESH_EXPIRE=7d

# CORS
FRONTEND_URL=https://freightflow.in
ALLOWED_ORIGINS=https://freightflow.in,https://www.freightflow.in,https://netlify.freightflow.in

# Third-party Services
GUPSHUP_API_KEY=your-gupshup-api-key
GUPSHUP_APP_ID=your-gupshup-app-id
GUPSHUP_FROM_PHONE=+91XXXXXXXXX

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@freightflow.in

# Error Tracking
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# AWS S3 (for invoice storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=freightflow-invoices

# OCR Service
OCR_API_KEY=your-ocr-api-key
OCR_API_URL=https://api.ocrspace.com/parse/image

# Monitoring & Analytics
DATADOG_API_KEY=your-datadog-key (optional)
AMPLITUDE_API_KEY=your-amplitude-key (optional)
```

---

## 🔗 **Phase 2: Frontend Setup (Day 1-2)**

### Step 1: Update Netlify Environment Variables

**In Netlify Dashboard:**

1. Site settings → Build & deploy → Environment
2. Add all frontend variables (see list above)
3. For each variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://api.freightflow.in`
   - Click Save

### Step 2: Create .env File (Local Development Only)

**File: `.env` (DO NOT COMMIT)**

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GA_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NODE_ENV=development
```

**File: `.env.example` (COMMIT TO GIT)**
```env
# This is a template. Copy to .env and fill in values.
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GA_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NODE_ENV=development
```

### Step 3: Add to .gitignore

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Dependencies
node_modules/
npm-debug.log*

# Build
dist/
build/

# Logs
logs/
*.log
```

### Step 4: Verify Frontend Configuration

```bash
# Check that environment variables are loaded
console.log('API URL:', process.env.REACT_APP_API_URL);

# Add to React component
function EnvironmentCheck() {
  return (
    <div>
      <p>API: {process.env.REACT_APP_API_URL}</p>
      <p>Analytics: {process.env.REACT_APP_GA_ID}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
}
```

---

## 🔐 **Phase 3: Backend Setup (Day 2)**

### Step 1: Add Environment Variables to Railway

**In Railway Dashboard:**

1. Select Backend project
2. Variables tab
3. Add each variable:
   - DATABASE_URL
   - JWT_SECRET (generate random 64-char string)
   - API_KEY (if needed)
   - etc.

### Step 2: Generate Secure Secrets

**Generate random JWT secret:**
```bash
# On Mac/Linux
openssl rand -hex 32

# Output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...

# On Windows (PowerShell)
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32|ForEach-Object {[char][byte](Get-Random -Min 33 -Max 127))} -join ""))) 
```

**Add to Railway:**
```
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...
```

### Step 3: Create .env File (Backend Local)

**File: `backend/.env` (DO NOT COMMIT)**

```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

DATABASE_URL=mongodb://localhost:27017/freightflow
JWT_SECRET=dev-secret-key-for-testing-only
FRONTEND_URL=http://localhost:3000

GUPSHUP_API_KEY=test-key
SENDGRID_API_KEY=test-key
```

**File: `backend/.env.example` (COMMIT TO GIT)**
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

DATABASE_URL=mongodb://localhost:27017/freightflow
JWT_SECRET=generate-a-random-secret
FRONTEND_URL=http://localhost:3000

GUPSHUP_API_KEY=your-gupshup-key
SENDGRID_API_KEY=your-sendgrid-key
```

### Step 4: Load Environment Variables in Code

**Using dotenv library:**

```bash
npm install dotenv
```

**In backend/server.js:**

```javascript
require('dotenv').config();

const express = require('express');
const app = express();

// Get values from environment
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET not defined in environment');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🗄️ **Phase 4: Database Configuration (Day 2-3)**

### MongoDB Atlas Setup

**1. Create MongoDB Account**
- Visit: https://www.mongodb.com/cloud/atlas
- Sign up (free)
- Create organization

**2. Create Cluster**
- Cluster name: `freightflow-prod`
- Cloud: AWS
- Region: ap-south-1 (Mumbai, India)
- Tier: M0 (512MB, free) for start → M2+ for production

**3. Create Database User**
- Database name: `freightflow`
- Username: `freightflow_user`
- Password: Generate strong password (save it!)
- Access: All networks (for now; restrict later)

**4. Get Connection String**

```
mongodb+srv://freightflow_user:PASSWORD@cluster.mongodb.net/freightflow?retryWrites=true&w=majority
```

Replace `PASSWORD` with actual password.

**5. Test Connection Locally**

```bash
# Install MongoDB CLI tools
# Or use MongoDB Compass GUI

# Connect and test
mongo "mongodb+srv://freightflow_user:PASSWORD@cluster.mongodb.net/freightflow"

# Create test collection
db.test.insertOne({ message: "Hello from FreightFlow" })

# Verify
db.test.find()
```

**6. Add to Railway Variables**

```
DATABASE_URL=mongodb+srv://freightflow_user:PASSWORD@cluster.mongodb.net/freightflow
```

### PostgreSQL Alternative (If Preferred)

**If using PostgreSQL instead:**

1. **Option A: Railway PostgreSQL**
   - Railway auto-provisions PostgreSQL
   - Connection string auto-added to variables
   - No additional setup needed

2. **Option B: External PostgreSQL**
   - Create account on: ElephantSQL, Neon, or RDS
   - Get connection string
   - Add to Railway variables

---

## 🔐 **Phase 5: API Authentication Setup (Day 3)**

### JWT Configuration

**Generate JWT secret (do once):**

```bash
# Generate 64-character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
```

**Store in Railway:**
```
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=another-long-random-secret
JWT_REFRESH_EXPIRE=7d
```

**Usage in Backend:**

```javascript
const jwt = require('jsonwebtoken');

// Sign token on login
function generateToken(userId) {
  return jwt.sign(
    { userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
}

// Verify token on protected routes
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
```

### API Key Configuration (Optional)

**For backend-to-backend communication:**

```javascript
// Generate API key
const API_KEY = require('crypto').randomBytes(32).toString('hex');

// Middleware to check API key
function checkApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid API key' });
  }
}

app.post('/api/webhook', checkApiKey, (req, res) => {
  // Process webhook
});
```

---

## 📧 **Phase 6: Third-Party Services Setup (Day 3-4)**

### Email Service (SendGrid)

**1. Create SendGrid Account**
- Visit: https://sendgrid.com
- Sign up (free tier: 100 emails/day)
- Verify email

**2. Generate API Key**
- Settings → API Keys → Create API Key
- Save key securely: `SG.xxxxxxxxxxxxxxxxxxxxx`

**3. Verify Sender Email**
- Settings → Sender Authentication
- Add sender: `noreply@freightflow.in`
- Verify domain (add DNS records)

**4. Add to Railway Variables**

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@freightflow.in
```

**5. Send Test Email**

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com',
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Test Email',
  text: 'Hello from FreightFlow!',
  html: '<strong>Hello from FreightFlow!</strong>',
};

await sgMail.send(msg);
console.log('✅ Email sent successfully');
```

### Gupshup WhatsApp Setup

**1. Create Gupshup Account**
- Visit: https://www.gupshup.io
- Sign up (free tier available)
- Create app

**2. Get API Credentials**
- App ID: `your-app-id`
- API Key: `your-api-key`
- Sender Phone: `+91XXXXXXXXX`

**3. Add to Railway Variables**

```
GUPSHUP_API_KEY=your-api-key
GUPSHUP_APP_ID=your-app-id
GUPSHUP_FROM_PHONE=+91XXXXXXXXX
```

**4. Send Test WhatsApp Message**

```javascript
const axios = require('axios');

async function sendWhatsAppMessage(phone, message) {
  const response = await axios.post(
    `https://api.gupshup.io/wa/api/v1/msg`,
    {
      phone: phone,
      message: message,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GUPSHUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

await sendWhatsAppMessage('+919999999999', 'Hello from FreightFlow!');
```

### Analytics Setup

**Google Analytics 4 (Frontend)**

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Sentry Error Tracking (Backend)**

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## 🔄 **Phase 7: Service Integration Testing (Day 4)**

### Test Each Service

**1. Database Connection**

```bash
# From backend
npm run test:db

# Output:
# ✅ MongoDB connected
# ✅ Collections created
# ✅ Indexes created
```

**2. Email Service**

```bash
npm run test:email

# Output:
# ✅ SendGrid API key valid
# ✅ Test email sent to admin@freightflow.in
```

**3. WhatsApp Service**

```bash
npm run test:whatsapp

# Output:
# ✅ Gupshup API key valid
# ✅ Test message sent to +919999999999
```

**4. Frontend ↔ Backend Communication**

```bash
npm run test:integration

# Runs:
# ✅ Frontend can reach backend API
# ✅ Authentication works
# ✅ Protected endpoints require token
# ✅ API returns expected data
```

---

## 📝 **Phase 8: Configuration Documentation (Day 4-5)**

### Create runbook.md

```markdown
# FreightFlow Production Runbook

## Environment Variables Checklist

### Frontend (Netlify)
- [ ] REACT_APP_API_URL points to api.freightflow.in
- [ ] REACT_APP_GA_ID configured
- [ ] REACT_APP_SENTRY_DSN configured

### Backend (Railway)
- [ ] DATABASE_URL working
- [ ] JWT_SECRET set (not hardcoded)
- [ ] FRONTEND_URL matches production domain
- [ ] Email service credentials configured
- [ ] Error tracking configured

### Services Status
- [ ] MongoDB Atlas accessible
- [ ] SendGrid API working
- [ ] Gupshup API working
- [ ] All credentials rotated recently

## Deployment Checklist
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to Railway
- [ ] Database migrations run
- [ ] Cache cleared
- [ ] Health checks pass
- [ ] Monitoring active
```

### Create credentials.md (DO NOT COMMIT)

```markdown
# Production Credentials (Keep Secret!)

## Database
- MongoDB Atlas URL: [LINK]
- Username: freightflow_user
- Password: [STORED IN PASSWORD MANAGER]

## API Keys
- SendGrid: [STORED IN PASSWORD MANAGER]
- Gupshup: [STORED IN PASSWORD MANAGER]
- JWT Secret: [STORED IN PASSWORD MANAGER]

## Access
- Railway Dashboard: https://railway.app
- MongoDB Atlas: https://cloud.mongodb.com
- Netlify: https://app.netlify.com

## Emergency Contact
- Ganesh: +91-XXXXXXXXX
```

---

## 🧪 **Phase 9: Full System Test (Day 5)**

### End-to-End Test

```javascript
const test = async () => {
  // 1. User signs up
  const signupRes = await fetch('https://api.freightflow.in/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123!',
      companyName: 'Test Company'
    })
  });
  const { token, user } = await signupRes.json();
  console.log('✅ User created:', user.email);

  // 2. User logs in
  const loginRes = await fetch('https://api.freightflow.in/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123!'
    })
  });
  const { token: loginToken } = await loginRes.json();
  console.log('✅ User logged in');

  // 3. Upload invoice
  const uploadRes = await fetch('https://api.freightflow.in/api/invoices/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${loginToken}` },
    body: formData  // PDF file
  });
  const { invoiceId } = await uploadRes.json();
  console.log('✅ Invoice uploaded:', invoiceId);

  // 4. Process invoice
  const processRes = await fetch('https://api.freightflow.in/api/invoices/process', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${loginToken}` },
    body: JSON.stringify({ invoiceId })
  });
  const { result } = await processRes.json();
  console.log('✅ Invoice processed:', result);

  // 5. Fetch dashboard data
  const dashboardRes = await fetch('https://api.freightflow.in/api/dashboard', {
    headers: { 'Authorization': `Bearer ${loginToken}` }
  });
  const { stats } = await dashboardRes.json();
  console.log('✅ Dashboard data:', stats);

  console.log('✅✅✅ All tests passed! ✅✅✅');
};

test().catch(err => console.error('❌ Test failed:', err));
```

---

## ✅ **Configuration Checklist**

**Day 1: Frontend Setup**
- [ ] Netlify environment variables added
- [ ] .env.example created
- [ ] .gitignore updated
- [ ] Frontend tests pass

**Day 2: Backend Setup**
- [ ] Railway variables added
- [ ] .env.example created
- [ ] Environment variables validated
- [ ] Backend tests pass

**Day 3: Database & Auth**
- [ ] MongoDB connection working
- [ ] JWT secrets generated
- [ ] Database migrations run
- [ ] Test data imported

**Day 4: Third-Party Services**
- [ ] SendGrid configured & tested
- [ ] Gupshup configured & tested
- [ ] Analytics configured
- [ ] Error tracking working

**Day 5: Integration Testing**
- [ ] All services tested
- [ ] End-to-end flow works
- [ ] Documentation complete
- [ ] Ready for production

---

## 🚀 **Pre-Launch Verification**

**Checklist (Day 6):**
- [ ] All environment variables set
- [ ] No hardcoded secrets in code
- [ ] All services responsive
- [ ] Database healthy
- [ ] Monitoring active
- [ ] Team trained on runbook
- [ ] Incident response plan ready
- [ ] Backup plan in place

**Go Live (Day 7):**
- [ ] Final smoke tests pass
- [ ] Team on standby
- [ ] Monitor dashboard active
- [ ] Deploy & verify
- [ ] Celebrate! 🎉

---

**Owner:** Ganesh Kumar  
**Duration:** 5-6 days (Phase 3.4)  
**Status:** Ready for Implementation  
**Last Updated:** May 15, 2026

---

## 📚 **Resources**

**Environment Management:**
- dotenv: https://github.com/motdotla/dotenv
- EnvKey: https://www.envkey.com (for teams)
- HashiCorp Vault: https://www.vaultproject.io (enterprise)

**Third-Party Documentation:**
- SendGrid: https://docs.sendgrid.com
- Gupshup: https://www.gupshup.io/developer/docs
- MongoDB: https://docs.mongodb.com
- JWT: https://jwt.io

**Security Best Practices:**
- OWASP: https://owasp.org
- Node.js Security: https://nodejs.org/en/docs/guides/security/
