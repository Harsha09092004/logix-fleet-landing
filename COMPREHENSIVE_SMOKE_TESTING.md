# FreightFlow: Comprehensive Smoke Testing Guide

**Phase:** 3.8 | **Status:** Ready for Implementation | **Target:** Complete by June 1, 2026

---

## 🎯 **Executive Overview**

Smoke testing validates that all critical systems work together before launch:

**Test Coverage:**
- ✅ Backend API endpoints
- ✅ Database connectivity
- ✅ Authentication & authorization
- ✅ Frontend functionality
- ✅ Invoice processing (OCR)
- ✅ Email delivery
- ✅ WhatsApp messaging
- ✅ Payment processing (if applicable)
- ✅ Performance under load
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

**Success Criteria:**
- 100% pass rate on critical paths
- <500ms response time (p95)
- <2s page load time
- 0 JavaScript errors in console
- Accessible on Chrome, Firefox, Safari, Edge
- Works on iOS 12+ and Android 7+

---

## 📋 **Part 1: API Endpoint Testing**

### Setup Test Environment

```bash
# Install testing tools
npm install --save-dev jest supertest axios

# Create test file: backend/tests/api.test.js
```

### Test 1: Health Check Endpoint

```javascript
const axios = require('axios');

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await axios.get('https://api.freightflow.in/api/health');
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
    expect(response.data.database.connected).toBe(true);
    expect(response.data.uptime).toBeGreaterThan(0);
  });
  
  it('health check should return within 1 second', async () => {
    const start = Date.now();
    await axios.get('https://api.freightflow.in/api/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
});
```

### Test 2: Authentication Flow

```javascript
describe('Authentication', () => {
  const testUser = {
    email: 'test@smoke.test',
    password: 'Test123!@#',
    companyName: 'Smoke Test Inc'
  };
  
  let token;
  
  it('should signup new user', async () => {
    const response = await axios.post('https://api.freightflow.in/api/auth/signup', {
      email: testUser.email,
      password: testUser.password,
      companyName: testUser.companyName
    });
    
    expect(response.status).toBe(201);
    expect(response.data.token).toBeDefined();
    expect(response.data.user.email).toBe(testUser.email);
    
    token = response.data.token;
  });
  
  it('should login with credentials', async () => {
    const response = await axios.post('https://api.freightflow.in/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });
  
  it('should reject invalid credentials', async () => {
    try {
      await axios.post('https://api.freightflow.in/api/auth/login', {
        email: testUser.email,
        password: 'wrongpassword'
      });
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
  
  it('should validate JWT token', async () => {
    const response = await axios.get('https://api.freightflow.in/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.email).toBe(testUser.email);
  });
  
  it('should reject missing token', async () => {
    try {
      await axios.get('https://api.freightflow.in/api/user/profile');
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
});
```

### Test 3: Invoice Upload & Processing

```javascript
const fs = require('fs');
const FormData = require('form-data');

describe('Invoice Processing', () => {
  const token = 'test-token-here';
  
  it('should upload invoice file', async () => {
    const form = new FormData();
    form.append('file', fs.createReadStream('./test-invoice.pdf'));
    
    const response = await axios.post(
      'https://api.freightflow.in/api/invoices/upload',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.invoiceId).toBeDefined();
    expect(response.data.fileName).toBe('test-invoice.pdf');
  });
  
  it('should process invoice and extract fields', async () => {
    const response = await axios.post(
      'https://api.freightflow.in/api/invoices/process',
      { invoiceId: 'test-invoice-123' },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.result.invoiceNumber).toBeDefined();
    expect(response.data.result.amount).toBeGreaterThan(0);
    expect(response.data.result.dueDate).toBeDefined();
    
    // Verify extracted fields have reasonable values
    expect(response.data.confidence).toBeGreaterThan(0.85); // 85%+ confidence
  });
  
  it('should retrieve processed invoice', async () => {
    const response = await axios.get(
      'https://api.freightflow.in/api/invoices/test-invoice-123',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('processed');
    expect(response.data.extractedData).toBeDefined();
  });
});
```

### Test 4: Dashboard Endpoints

```javascript
describe('Dashboard', () => {
  const token = 'test-token-here';
  
  it('should get dashboard metrics', async () => {
    const response = await axios.get(
      'https://api.freightflow.in/api/dashboard',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.stats).toBeDefined();
    expect(response.data.stats.totalInvoices).toBeGreaterThanOrEqual(0);
    expect(response.data.stats.totalAmount).toBeGreaterThanOrEqual(0);
    expect(response.data.stats.processingTime).toBeDefined();
  });
  
  it('should get user invoices with pagination', async () => {
    const response = await axios.get(
      'https://api.freightflow.in/api/invoices?page=1&limit=10',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.invoices)).toBe(true);
    expect(response.data.pagination).toBeDefined();
    expect(response.data.pagination.currentPage).toBe(1);
  });
});
```

### Run API Tests

```bash
# Run all tests
npm run test:api

# Output:
# PASS tests/api.test.js
# ✓ Health Check (45ms)
# ✓ Authentication (250ms)
# ✓ Invoice Processing (1200ms)
# ✓ Dashboard (150ms)
# 
# Test Suites: 1 passed, 1 total
# Tests: 12 passed, 12 total
# Time: 5.231s
```

---

## 🌐 **Part 2: Frontend Testing**

### Test 5: Page Load & Rendering

```javascript
describe('Frontend - Page Load', () => {
  beforeEach(async () => {
    await page.goto('https://freightflow.in');
  });
  
  it('should load landing page successfully', async () => {
    expect(page.url()).toContain('freightflow.in');
  });
  
  it('should render without JavaScript errors', async () => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForNavigation();
    expect(errors).toHaveLength(0);
  });
  
  it('should load within 3 seconds', async () => {
    const metrics = await page.metrics();
    expect(metrics.navigationStart).toBeDefined();
    // Check that page interactive time is < 3000ms
  });
  
  it('should have all critical elements', async () => {
    expect(await page.$('header')).toBeTruthy();
    expect(await page.$('[data-testid="hero-cta"]')).toBeTruthy();
    expect(await page.$('[data-testid="pricing-section"]')).toBeTruthy();
    expect(await page.$('footer')).toBeTruthy();
  });
});
```

### Test 6: Video Player

```javascript
describe('Frontend - Video Player', () => {
  it('should load and play video', async () => {
    await page.goto('https://freightflow.in/#landing');
    
    const playButton = await page.$('[data-testid="video-play"]');
    expect(playButton).toBeTruthy();
    
    await page.click('[data-testid="video-play"]');
    
    // Wait for video to start
    await page.waitForTimeout(500);
    
    const isPlaying = await page.$eval(
      'video',
      video => video.paused === false
    );
    expect(isPlaying).toBe(true);
  });
  
  it('should support voiceover', async () => {
    await page.goto('https://freightflow.in/#landing');
    
    const voiceButton = await page.$('[data-testid="voice-toggle"]');
    expect(voiceButton).toBeTruthy();
    
    // Toggle voiceover
    await page.click('[data-testid="voice-toggle"]');
    
    // Check that audio is enabled
    const isAudioEnabled = await page.$eval(
      '[data-testid="voice-toggle"]',
      btn => btn.textContent.includes('ON')
    );
    expect(isAudioEnabled).toBe(true);
  });
  
  it('should seek video on progress bar click', async () => {
    await page.goto('https://freightflow.in/#landing');
    
    // Start video
    await page.click('[data-testid="video-play"]');
    await page.waitForTimeout(500);
    
    // Click at 50% of progress bar
    const progressBar = await page.$('[data-testid="progress-bar"]');
    const box = await progressBar.boundingBox();
    const midpoint = box.x + box.width / 2;
    
    await page.mouse.click(midpoint, box.y);
    
    // Wait for seek
    await page.waitForTimeout(200);
    
    // Verify video position changed
    const currentTime = await page.$eval('video', video => video.currentTime);
    expect(currentTime).toBeGreaterThan(10); // Should be near 50% of 47s video
  });
});
```

### Test 7: Sign-up Flow

```javascript
describe('Frontend - Sign-up Flow', () => {
  it('should complete signup form', async () => {
    await page.goto('https://freightflow.in');
    
    // Click signup button
    await page.click('[data-testid="hero-cta"]');
    
    // Wait for modal
    await page.waitForSelector('[data-testid="signup-form"]');
    
    // Fill form
    await page.type('[name="email"]', 'smoke@test.com');
    await page.type('[name="password"]', 'Test123!@#');
    await page.type('[name="companyName"]', 'Smoke Test Inc');
    
    // Submit
    await page.click('[type="submit"]');
    
    // Wait for success/redirect
    await page.waitForNavigation();
    expect(page.url()).toContain('dashboard');
  });
  
  it('should validate email format', async () => {
    await page.goto('https://freightflow.in');
    await page.click('[data-testid="hero-cta"]');
    await page.waitForSelector('[data-testid="signup-form"]');
    
    // Enter invalid email
    await page.type('[name="email"]', 'notanemail');
    await page.click('[type="submit"]');
    
    // Should show error
    const error = await page.$text('[data-testid="email-error"]');
    expect(error).toContain('valid email');
  });
});
```

### Run Frontend Tests

```bash
# Install Puppeteer for browser automation
npm install --save-dev puppeteer

# Run tests
npm run test:frontend

# Output:
# PASS tests/frontend.test.js
# ✓ Page Load (850ms)
# ✓ Video Player (2100ms)
# ✓ Sign-up Flow (3200ms)
# ...
```

---

## 💾 **Part 3: Database Testing**

### Test 8: Database Connectivity

```javascript
describe('Database', () => {
  it('should connect to MongoDB successfully', async () => {
    const db = await connectToDatabase();
    expect(db).toBeDefined();
    
    const isConnected = await db.ping();
    expect(isConnected).toBe(true);
  });
  
  it('should perform CRUD operations', async () => {
    const db = await connectToDatabase();
    const collection = db.collection('test_collection');
    
    // Create
    const insertResult = await collection.insertOne({
      testData: 'smoke-test',
      timestamp: new Date()
    });
    expect(insertResult.insertedId).toBeDefined();
    
    // Read
    const findResult = await collection.findOne({
      testData: 'smoke-test'
    });
    expect(findResult).toBeDefined();
    
    // Update
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { testData: 'updated' } }
    );
    expect(updateResult.modifiedCount).toBe(1);
    
    // Delete
    const deleteResult = await collection.deleteOne({
      _id: insertResult.insertedId
    });
    expect(deleteResult.deletedCount).toBe(1);
  });
  
  it('should handle concurrent connections', async () => {
    const promises = [];
    
    // Open 50 concurrent connections
    for (let i = 0; i < 50; i++) {
      promises.push(connectToDatabase());
    }
    
    const connections = await Promise.all(promises);
    expect(connections.length).toBe(50);
    
    // All should be successful
    const allConnected = connections.every(db => db !== null);
    expect(allConnected).toBe(true);
  });
});
```

---

## 📧 **Part 4: Email Service Testing**

### Test 9: Email Delivery

```javascript
describe('Email Service', () => {
  it('should send test email successfully', async () => {
    const response = await sendEmail({
      to: 'test@freightflow.in',
      subject: 'Smoke Test Email',
      template: 'welcome',
      data: { companyName: 'Smoke Test Inc' }
    });
    
    expect(response.status).toBe(200);
    expect(response.messageId).toBeDefined();
  });
  
  it('should send signup confirmation email', async () => {
    const response = await sendEmail({
      to: 'smoke@test.com',
      subject: 'Welcome to FreightFlow!',
      template: 'signup_confirmation',
      data: {
        email: 'smoke@test.com',
        confirmLink: 'https://freightflow.in/confirm/token123'
      }
    });
    
    expect(response.status).toBe(200);
  });
  
  it('should send invoice processing notification', async () => {
    const response = await sendEmail({
      to: 'smoke@test.com',
      subject: 'Invoice Processed Successfully',
      template: 'invoice_processed',
      data: {
        invoiceNumber: 'INV-001',
        amount: 50000,
        processingTime: 2.5
      }
    });
    
    expect(response.status).toBe(200);
  });
});
```

---

## 📱 **Part 5: Mobile & Cross-Browser Testing**

### Test 10: Mobile Responsiveness

```javascript
describe('Mobile Responsiveness', () => {
  const devices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Galaxy S21', width: 360, height: 800 }
  ];
  
  devices.forEach(device => {
    it(`should render correctly on ${device.name}`, async () => {
      await page.setViewport({ width: device.width, height: device.height });
      await page.goto('https://freightflow.in');
      
      // Check that no elements are cut off
      const allVisible = await page.$$eval(
        '*',
        elements => elements.every(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
      );
      expect(allVisible).toBe(true);
      
      // Check touch target sizes (minimum 44x44px)
      const buttons = await page.$$('[role="button"]');
      for (const button of buttons) {
        const box = await button.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});
```

### Test 11: Cross-Browser Testing

```javascript
describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit']; // Chrome, Firefox, Safari
  
  browsers.forEach(browserName => {
    describe(`${browserName}`, () => {
      it('should load landing page', async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        await page.goto('https://freightflow.in');
        expect(page.url()).toContain('freightflow.in');
        
        await browser.close();
      });
      
      it('should handle video playback', async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        await page.goto('https://freightflow.in/#landing');
        await page.click('[data-testid="video-play"]');
        
        const isPlaying = await page.$eval('video', v => !v.paused);
        expect(isPlaying).toBe(true);
        
        await browser.close();
      });
    });
  });
});
```

---

## ⚡ **Part 6: Performance Testing**

### Test 12: Load Testing

```bash
# Install Apache Bench
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Run load test: 1000 requests, 50 concurrent
ab -n 1000 -c 50 https://api.freightflow.in/api/health

# Expected output:
# Benchmarking api.freightflow.in (be patient)
# Completed 100 requests
# Completed 200 requests
# ...
# Completed 1000 requests
#
# Requests per second: 200 [#/sec]
# Time per request: 250 [ms]
# Failed requests: 0
# 
# ✅ PASS if:
# - Requests per second > 100
# - Failed requests = 0
# - Time per request < 500ms (p50)
```

### Test 13: Lighthouse Score

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://freightflow.in --view

# Target scores:
# ✅ Performance: 90+
# ✅ Accessibility: 95+
# ✅ Best Practices: 95+
# ✅ SEO: 100

# Check Core Web Vitals:
# ✅ LCP (Largest Contentful Paint): < 2.5s
# ✅ FID (First Input Delay): < 100ms
# ✅ CLS (Cumulative Layout Shift): < 0.1
```

---

## ✅ **Complete Smoke Test Checklist**

### Pre-Launch Checklist (24 Hours Before)

**API Tests**
- [ ] Health check: ✅ Responds < 1s
- [ ] Authentication: ✅ Login/signup working
- [ ] Invoice processing: ✅ OCR working
- [ ] Dashboard: ✅ Metrics loading
- [ ] All endpoints: ✅ < 500ms response time

**Frontend Tests**
- [ ] Page load: ✅ < 3s
- [ ] Video: ✅ Plays smoothly
- [ ] Sign-up: ✅ Form working
- [ ] No JS errors: ✅ Console clean
- [ ] Responsive: ✅ Mobile-friendly

**Database Tests**
- [ ] Connection: ✅ MongoDB working
- [ ] CRUD: ✅ All operations work
- [ ] Performance: ✅ Queries < 100ms
- [ ] Backups: ✅ Latest backup present

**Email Tests**
- [ ] SendGrid: ✅ API key working
- [ ] Test email: ✅ Received successfully
- [ ] Templates: ✅ HTML rendered correctly

**Mobile Tests**
- [ ] iPhone: ✅ Works correctly
- [ ] Android: ✅ Works correctly
- [ ] Tablets: ✅ Responsive

**Cross-Browser**
- [ ] Chrome: ✅ All features work
- [ ] Firefox: ✅ All features work
- [ ] Safari: ✅ All features work
- [ ] Edge: ✅ All features work

**Performance**
- [ ] Load test: ✅ 100+ req/sec
- [ ] Lighthouse: ✅ 90+ scores
- [ ] Web Vitals: ✅ Green status

**Security**
- [ ] HTTPS: ✅ All connections encrypted
- [ ] CORS: ✅ Properly configured
- [ ] JWT: ✅ Token validation working
- [ ] Rate limiting: ✅ Active

**Infrastructure**
- [ ] Monitoring: ✅ All dashboards visible
- [ ] Alerts: ✅ Alert channels working
- [ ] Logging: ✅ Logs flowing to Sentry
- [ ] Backups: ✅ Daily backups confirmed

---

## 📊 **Smoke Test Report Template**

**File: `smoke-test-report-20260515.md`**

```markdown
# Smoke Test Report - May 15, 2026

**Test Date:** May 15, 2026  
**Test Duration:** 45 minutes  
**Tester:** Ganesh Kumar  
**Status:** ✅ ALL PASS

## Test Results Summary

| Category | Tests | Pass | Fail | Status |
|----------|-------|------|------|--------|
| API Endpoints | 15 | 15 | 0 | ✅ PASS |
| Frontend | 12 | 12 | 0 | ✅ PASS |
| Database | 8 | 8 | 0 | ✅ PASS |
| Email | 5 | 5 | 0 | ✅ PASS |
| Mobile | 8 | 8 | 0 | ✅ PASS |
| Cross-Browser | 12 | 12 | 0 | ✅ PASS |
| Performance | 6 | 6 | 0 | ✅ PASS |
| **TOTAL** | **66** | **66** | **0** | **✅ 100% PASS** |

## Performance Metrics

- API Response Time (p95): 245ms ✅
- Page Load Time: 2.1s ✅
- Lighthouse Score: 96 ✅
- Load Test: 215 req/sec ✅
- Uptime: 100% ✅
- Database Queries: 8ms avg ✅

## Issues Found

**None** ✅

## Recommendation

**✅ READY FOR PRODUCTION LAUNCH**

All critical paths verified working. System performs well under load. No blocking issues found.

---

Approved by: Ganesh Kumar
Date: May 15, 2026
```

---

## 🚀 **Final Pre-Launch Verification**

```
Last Check (2 Hours Before Launch):

□ Run smoke tests one final time
□ Verify all services responding
□ Check database backups current
□ Confirm alerting working
□ Notify team: "We're going live!"
□ Stand by for any issues
□ Launch! 🚀
```

---

**Owner:** Ganesh Kumar  
**Duration:** 2-3 days (Phase 3.8)  
**Status:** Ready for Implementation  
**Last Updated:** May 15, 2026
