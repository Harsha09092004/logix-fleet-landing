# FreightFlow: Comprehensive Monitoring & Observability Guide

**Phase:** 3.6 | **Status:** Ready for Implementation | **Target:** Complete by June 2, 2026

---

## 🎯 **Executive Overview**

Production monitoring answers: "Is FreightFlow working right now?"

**Monitoring Stack:**
- **Frontend:** Netlify analytics + Sentry errors
- **Backend:** Railway metrics + Winston logs + Sentry
- **Database:** MongoDB Atlas monitoring + query performance
- **Business:** Google Analytics 4 + custom event tracking
- **Infrastructure:** Uptime monitoring + alert system

**Success Metrics:**
- 99.9% uptime
- <1% error rate
- <500ms response time (p95)
- <100ms API latency
- <2s frontend load time

---

## 📊 **Part 1: Frontend Monitoring (Netlify)**

### Step 1: Netlify Analytics Setup

**Enable Netlify Analytics:**

1. **Dashboard → Site Settings → Analytics**
2. **Subscribe to Netlify Analytics** ($9/month)

**Key Metrics:**

```
Daily Active Users: 150-300
Page Views: 500-1000
Bounce Rate: 25-35%
Avg Session Duration: 3-5 minutes
Top Pages:
  1. /landing (40%)
  2. /pricing (25%)
  3. /video (20%)
  4. /demo (15%)
```

### Step 2: Google Analytics 4 Setup

**Add GA4 to Frontend:**

```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    page_path: window.location.pathname,
  });
</script>
```

**Custom Events to Track:**

```javascript
// Track video started
document.getElementById('video').addEventListener('play', () => {
  gtag('event', 'video_start', {
    video_title: 'FreightFlow Explainer',
    video_duration: 47
  });
});

// Track signup click
document.getElementById('signup').addEventListener('click', () => {
  gtag('event', 'sign_up_click', {
    button_location: 'hero_cta'
  });
});

// Track pricing table interaction
document.getElementById('pricing').addEventListener('scroll', () => {
  gtag('event', 'pricing_view', {
    scroll_depth: 75
  });
});

// Track demo booking
document.getElementById('book-demo').addEventListener('click', () => {
  gtag('event', 'demo_booked', {
    plan_type: 'pro'
  });
});
```

**GA4 Dashboard:**
```
Real-time Dashboard:
├── Active Users: [Live count]
├── Event Count: [Per minute]
├── Session Count: [Current]
└── Conversion Rate: [Signup/visitor %]

7-Day Report:
├── Users: 1,200
├── Sessions: 1,800
├── Video Completion: 65%
├── Demo Bookings: 23
└── Signup Conversion: 2.1%
```

### Step 3: Sentry Frontend Error Tracking

**Install Sentry:**

```bash
npm install @sentry/react @sentry/tracing
```

**Initialize in React:**

```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});

export default Sentry.withProfiler(App);
```

**Track Errors Automatically:**

```javascript
// All JavaScript errors automatically captured
// Example in component:

try {
  await uploadVideo();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'video_upload',
      user_id: userId
    }
  });
}
```

**Sentry Dashboard:**

```
Error Tracking (Realtime):
├── Total Errors: 12 today
├── Error Rate: 0.1%
├── Top Error: "Video upload failed" (5 issues)
├── Affected Users: 8
├── Avg Error Time: 2s after load

Error Details:
├── Stack trace
├── Browser/OS
├── Session replay
├── Breadcrumbs (user actions)
└── Related events
```

---

## 🖥️ **Part 2: Backend Monitoring (Railway)**

### Step 1: Railway Built-in Monitoring

**In Railway Dashboard:**

1. **Select Project → Deployments → Metrics**
2. View real-time:
   - CPU usage
   - Memory usage
   - Network I/O
   - Request count
   - Response time

**Setup Metrics:**

```
CPU Usage:
├── Current: 15%
├── Max: 95%
├── Alert if > 80%

Memory Usage:
├── Current: 256 MB
├── Max: 512 MB
├── Alert if > 400 MB

Request Count:
├── Current: 50 req/sec
├── Peak: 200 req/sec
├── Goal: < 100 req/sec

Response Time (p95):
├── Current: 150ms
├── Target: < 500ms
├── Alert if > 1000ms
```

### Step 2: Backend Logging with Winston

**Install Winston:**

```bash
npm install winston
```

**Configure Logger:**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'freightflow-api' },
  transports: [
    // File logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
    // Console (development)
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

**Usage in Code:**

```javascript
const logger = require('./logger');

// Log application events
logger.info('Server started', { port: 5000 });

// Log API requests
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    timestamp: new Date()
  });
  next();
});

// Log errors
app.use((err, req, res, next) => {
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Log database operations
logger.info('Invoice processed', {
  invoiceId: '12345',
  processingTime: 2.5,
  fieldCount: 15
});
```

### Step 3: Health Check Endpoint

**Create `/api/health` endpoint:**

```javascript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseConnection();
    
    // Check memory
    const memUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    const health = {
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      database: {
        connected: dbHealth,
        responseTime: dbHealth.responseTime
      },
      environment: process.env.NODE_ENV
    };
    
    res.json(health);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

**Monitor Health:**

```bash
# Curl health endpoint every 30 seconds
watch -n 30 'curl https://api.freightflow.in/api/health | jq'

# Output:
{
  "status": "healthy",
  "timestamp": "2026-05-15T10:30:45Z",
  "uptime": 86400,
  "memory": {
    "heapUsed": 245,
    "heapTotal": 512
  },
  "database": {
    "connected": true,
    "responseTime": 2
  },
  "environment": "production"
}
```

---

## 🗄️ **Part 3: Database Monitoring (MongoDB)**

### Step 1: MongoDB Atlas Monitoring

**In Atlas Dashboard:**

1. **Cluster → Metrics**
2. View:
   - CPU usage
   - Memory usage
   - Query performance
   - Network I/O
   - Storage usage

**Key Metrics:**

```
CPU:
├── Current: 8%
├── 7-day avg: 12%
├── Alert if > 60%

Memory:
├── Current: 120 MB (25% of 512 MB)
├── 7-day max: 280 MB
├── Alert if > 450 MB

Connections:
├── Current: 15
├── Max allowed: 500
├── Alert if > 400

Query Performance:
├── Avg latency: 5ms
├── 95th percentile: 25ms
├── Alert if > 100ms
```

### Step 2: Query Profiling

**Enable profiling in MongoDB:**

```javascript
// In initialization code
db.setProfilingLevel(1, { slowms: 100 });
// This logs queries slower than 100ms
```

**View slow queries:**

```bash
mongo --eval "db.system.profile.find().sort({ts: -1}).limit(10).pretty()"

# Output shows slow queries:
{
  "op": "query",
  "ns": "freightflow.invoices",
  "millis": 150,
  "execStats": {
    "executionStages": {
      "stage": "COLLSCAN"  // ← Slow! No index
    }
  }
}
```

### Step 3: Create Missing Indexes

**Optimize based on profiling:**

```javascript
// Add index for frequently queried fields
db.invoices.createIndex({ userId: 1, createdAt: -1 });
db.invoices.createIndex({ status: 1, dueDate: 1 });
db.users.createIndex({ email: 1 }, { unique: true });

// Verify indexes
db.invoices.getIndexes();
```

---

## ⚠️ **Part 4: Error Tracking (Sentry)**

### Step 1: Sentry Configuration

**Backend Sentry Setup:**

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.5,  // Trace 50% of transactions
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ]
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Step 2: Error Alert Rules

**Create Alerts in Sentry:**

```
Alert 1: High Error Rate
├── Condition: Error rate > 1% in last 5 minutes
├── Notify: #alerts Slack channel
├── Severity: Critical

Alert 2: Unusual Error Pattern
├── Condition: 10+ occurrences of same error type
├── Notify: #alerts Slack channel
├── Severity: Warning

Alert 3: Database Connection Error
├── Condition: Error contains "Connection timeout"
├── Notify: SMS + Slack + Email
├── Severity: Critical
```

### Step 3: Error Dashboard

**Sentry Dashboard View:**

```
Error Overview (7-day):
├── Total Errors: 23
├── Error Rate: 0.08%
├── Affected Users: 12
├── Unique Issues: 8

Top Errors:
1. "Invoice OCR failed" (8 issues)
   └── Error Rate: 0.05%
   └── Last 24h: 3 occurrences
   └── Stack trace available

2. "Database connection timeout" (5 issues)
   └── Related to Query: "Find invoices by user"
   └── Possible cause: N+1 query problem

3. "Authentication token invalid" (4 issues)
   └── Usually after 12+ hours session
   └── Consider token refresh
```

---

## 📈 **Part 5: Performance Monitoring**

### Step 1: API Performance Tracking

**Middleware to track response times:**

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = duration > 1000 ? 'warn' : 'info';
    
    logger.log(level, 'API Response Time', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    // Send to monitoring service
    if (process.env.DATADOG_API_KEY) {
      datadog.gauge('api.response_time', duration, {
        endpoint: req.path,
        method: req.method
      });
    }
  });
  
  next();
});
```

### Step 2: Frontend Performance (Core Web Vitals)

**Track in GA4:**

```javascript
// Google's Web Vitals library
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => gtag('event', 'page_view', {
  metric_name: 'CLS',
  value: metric.value
}));

getFID(metric => gtag('event', 'page_view', {
  metric_name: 'FID',
  value: metric.value
}));

getLCP(metric => gtag('event', 'page_view', {
  metric_name: 'LCP',
  value: metric.value
}));
```

**Target Metrics:**

```
Core Web Vitals Targets:
├── LCP (Largest Contentful Paint): < 2.5s
├── FID (First Input Delay): < 100ms
├── CLS (Cumulative Layout Shift): < 0.1
└── Overall: "GOOD" rating

Lighthouse Targets:
├── Performance: 90+
├── Accessibility: 95+
├── Best Practices: 95+
└── SEO: 100
```

---

## 🔔 **Part 6: Alerting & Notifications**

### Step 1: Slack Integration

**Connect Sentry to Slack:**

1. **Settings → Integrations → Slack**
2. **Authorize Slack workspace**
3. **Add to channel: #alerts**

**Alert Message Example:**

```
🚨 ERROR: Invoice Processing Failed

Project: FreightFlow API
Environment: Production
Error: "OCR API timeout after 30s"

Stack Trace:
  at processInvoice (invoice.service.js:45)
  at uploadInvoice (controller.js:89)

Affected Users: 3
First Occurrence: 15 mins ago
Issue: https://sentry.io/issues/xxxxx

[Resolve] [Ignore] [Subscribe]
```

### Step 2: Email Alerts

**Critical Alerts to Email:**

```
Alert: Database Down
├── Recipients: ganesh@freightflow.in, tech@freightflow.in
├── Subject: 🚨 CRITICAL: Database Connection Lost
├── Trigger: DatabaseConnection error rate > 50%
├── Send Immediately

Alert: High Memory Usage
├── Recipients: ops@freightflow.in
├── Subject: ⚠️ WARNING: Memory usage 85%
├── Trigger: Memory > 400 MB
├── Send Immediately

Alert: Daily Summary
├── Recipients: ganesh@freightflow.in
├── Subject: 📊 Daily Monitoring Report
├── Trigger: Every 9 AM UTC
├── Includes: Uptime, errors, performance
```

### Step 3: On-Call Alerts (SMS/Phone)

**For critical issues only:**

```
SMS Alert on:
├── Database connection failed
├── API error rate > 5%
├── System CPU > 90%
├── Monthly invoice processing failed

SMS Message:
"🚨 CRITICAL: FreightFlow API down. 
Error: Database connection timeout.
Check Sentry: https://sentry.io/issues/xxxxx
Reply 'ack' to confirm"
```

---

## 📊 **Part 7: Monitoring Dashboard**

### Build Unified Dashboard

**Create dashboard.html (Internal Only):**

```html
<!DOCTYPE html>
<html>
<head>
  <title>FreightFlow Monitoring Dashboard</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
</head>
<body>
  <h1>🎯 FreightFlow Production Status</h1>
  
  <div class="status-cards">
    <div class="card">
      <h3>System Health</h3>
      <p class="metric">Status: <span id="health">Loading...</span></p>
      <p class="metric">Uptime: <span id="uptime">Loading...</span></p>
      <p class="metric">API Response: <span id="latency">Loading...</span>ms</p>
    </div>
    
    <div class="card">
      <h3>Error Rate</h3>
      <p class="metric">Error Rate: <span id="error-rate">Loading...</span>%</p>
      <p class="metric">Today: <span id="error-count">Loading...</span> errors</p>
      <p class="metric">Sentry Status: <span id="sentry-status">Loading...</span></p>
    </div>
    
    <div class="card">
      <h3>Performance</h3>
      <p class="metric">p95 Latency: <span id="p95">Loading...</span>ms</p>
      <p class="metric">Throughput: <span id="throughput">Loading...</span> req/s</p>
      <p class="metric">Memory: <span id="memory">Loading...</span>%</p>
    </div>
  </div>
  
  <canvas id="uptimeChart"></canvas>
  <canvas id="errorChart"></canvas>
  <canvas id="latencyChart"></canvas>
  
  <script>
    setInterval(fetchMetrics, 30000);  // Update every 30s
    
    async function fetchMetrics() {
      const health = await fetch('https://api.freightflow.in/api/health');
      const data = await health.json();
      
      document.getElementById('health').textContent = data.status.toUpperCase();
      document.getElementById('uptime').textContent = formatUptime(data.uptime);
      // ... update other metrics
    }
  </script>
</body>
</html>
```

---

## ✅ **Monitoring Checklist**

**Day 1: Frontend Monitoring**
- [ ] GA4 tracking code added
- [ ] Sentry initialized in React
- [ ] Custom events configured
- [ ] Netlify analytics enabled

**Day 2: Backend Monitoring**
- [ ] Winston logging configured
- [ ] Health check endpoint working
- [ ] Railway metrics visible
- [ ] Performance tracking working

**Day 3: Database Monitoring**
- [ ] MongoDB Atlas monitoring enabled
- [ ] Slow query profiling on
- [ ] Missing indexes identified
- [ ] Indexes created

**Day 4: Error Tracking**
- [ ] Sentry configured
- [ ] Alert rules created
- [ ] Slack integration working
- [ ] Error dashboard populated

**Day 5: Alerting**
- [ ] Slack alerts flowing
- [ ] Email alerts configured
- [ ] SMS alerts for critical (optional)
- [ ] On-call rotation set

**Day 6: Dashboard**
- [ ] Unified dashboard built
- [ ] All metrics visible
- [ ] Real-time updates working
- [ ] Team can access

**Day 7: Validation**
- [ ] Test alert by creating error
- [ ] Verify all notifications arrive
- [ ] Check dashboard accuracy
- [ ] Document process

---

## 📚 **Resources**

- **Sentry Docs:** https://docs.sentry.io/
- **Winston Logger:** https://github.com/winstonjs/winston
- **GA4 Setup:** https://support.google.com/analytics/
- **MongoDB Monitoring:** https://docs.mongodb.com/manual/administration/monitoring/
- **Railway Metrics:** https://docs.railway.app/

---

**Owner:** Ganesh Kumar  
**Duration:** 2-3 days (Phase 3.6)  
**Status:** Ready for Implementation  
**Last Updated:** May 15, 2026
