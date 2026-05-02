# FREIGHTFLOW NOMADIA FEATURES - REAL DATA TESTING GUIDE

## 📋 CURRENT STATUS

✅ **Backend Server**: Running on http://localhost:5000  
✅ **4 Real-Data Endpoints**: GPS Tracking, POD, Route Optimization, Driver App  
✅ **Frontend Pages**: All 6 Nomadia features ready  
✅ **Database Schema**: Defined and ready  
❌ **MongoDB Connection**: ECONNREFUSED (service not running)

---

## 🚀 OPTION 1: Start MongoDB Locally (Windows)

### Step 1: Download MongoDB Community Edition

Visit: https://www.mongodb.com/try/download/community

- Select **Windows** platform
- Download the **MSI installer**
- Run installer with default settings (installs to `C:\Program Files\MongoDB\Server\7.0`)

### Step 2: Start MongoDB Service

**Option A - Using MongoDB Service:**
```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB
```

**Option B - Run MongoDB Directly:**
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB server
"C:\Program Files\MongoDB\Server\7.0\bin\mongod" --dbpath "C:\data\db"

# Server will show: listening on 127.0.0.1:27017
```

**Option C - Using MongoDB Compass (GUI):**
1. Download from https://www.mongodb.com/products/tools/compass
2. Install and open
3. It will auto-detect local MongoDB instance
4. Create database: `freightflow`

### Step 3: Insert Test Data

Once MongoDB is running:

```powershell
cd "c:\Users\RESHMA B\Downloads\Logix\backend"
node insert-real-test-data.js
```

**Expected Output:**
```
🚀 FREIGHTFLOW TEST DATA SETUP
✅ MongoDB Connected

📦 Inserting test shipments...
  ✓ Inserted 8 shipments
    • in-transit: 3
    • out-for-delivery: 1
    • pending: 1
    • ready-for-dispatch: 1
    • delivered: 1

🚗 Inserting test vehicles...
  ✓ Inserted 5 vehicles
    • active: 4
    • inactive: 1
```

### Step 4: Test API Endpoints

With test data inserted:

```powershell
node test-nomadia-endpoints.js
```

**Expected Output:**
```
🧪 FREIGHTFLOW NOMADIA FEATURES - API TEST SUITE

TEST 1: GET /api/shipments/tracking
✅ GPS Tracking endpoint works
📦 Found 8 shipments in transit

TEST 2: POST /api/shipments/pod/submit
✅ POD Submit endpoint works
📋 POD ID: pod-0001
✓ Delivered to: Mr. Raj Kumar

TEST 3: POST /api/routes/optimize
✅ Route Optimization endpoint works
🛣️  Optimized routes: 4

TEST 4: GET /api/drivers/assignments
✅ Driver Assignments endpoint works
👨‍💼 Active drivers: 4

📊 TEST SUMMARY
✅ Passed: 4
❌ Failed: 0
📈 Success Rate: 100%
```

---

## 🌐 OPTION 2: Use MongoDB Atlas (Cloud)

**No local installation needed - cloud database**

### Step 1: Create Free Account

1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up (free tier = 512MB storage)
3. Create cluster (takes ~3-5 minutes)
4. Create database user with credentials

### Step 2: Update Connection String

Edit `.env` in `backend/`:

```
MONGO_URI=mongodb+srv://username:password@cluster-xxx.mongodb.net/freightflow?retryWrites=true&w=majority
```

Replace:
- `username` = Your Atl user
- `password` = Your Atlas password  
- `cluster-xxx` = Your cluster URL

### Step 3: Restart Backend & Insert Test Data

```powershell
# Terminal 1: Restart backend (will auto-connect to Atlas)
cd backend && node server.js

# Terminal 2: Insert test data
cd backend && node insert-real-test-data.js
```

---

## 📱 OPTION 3: Test Without MongoDB (Immediate Demo)

The backend **gracefully degrades** without MongoDB. You can:

### A) Test Backend Endpoints Directly

**GPS Tracking** (returns empty without data):
```
GET http://localhost:5000/api/shipments/tracking
```

**POD Submit** (works in memory):
```
POST http://localhost:5000/api/shipments/pod/submit
Body: {
  "shipmentId": "ship-001",
  "receiverName": "Test User",
  "receiverPhone": "9876543210",
  "paymentMethod": "cash",
  "amountCollected": 0
}
```

**Route Optimization** (returns empty routes):
```
POST http://localhost:5000/api/routes/optimize
Body: { "filters": {} }
```

### B) Frontend Pages (Will Show "No Data" State)

All pages are **fully functional UI** even without data:

1. **GPS Tracking Page**: Shows map, filters, real-time mock data fallback
2. **Proof of Delivery**: Camera, signature, form submissions work
3. **Route Optimization**: Form accepts inputs, shows mock optimization
4. **Driver App**: Dashboard structure visible, ready for real data

Visit: http://localhost:5000/

---

## 🧪 TESTING CHECKLIST

### Without Real Data (Current State)
- [x] Backend running on port 5000
- [x] All 4 API endpoints accessible (return empty data)
- [x] Frontend loads successfully
- [x] Pages load without errors
- [x] UI components responsive

### With Real Test Data (After MongoDB Setup)
- [ ] Insert 8 shipments + 5 vehicles
- [ ] GPS Tracking shows real shipments in transit
- [ ] POD submit saves to database
- [ ] Route Optimization groups shipments intelligently
- [ ] Driver app shows real assignments
- [ ] All 4 tests pass in test-nomadia-endpoints.js

---

## 📊 TEST DATA REFERENCE

After running `insert-real-test-data.js`, you'll have:

### Shipments (8 total)
```
ship-001: Mumbai → Delhi        (Electronics, 45.5 kg, In-Transit, High Priority)
ship-002: Bangalore → Hyderabad (Textiles, 120 kg, In-Transit, Medium Priority)
ship-003: Chennai → Pune        (Pharma, 22.3 kg, Out-for-Delivery, Critical)
ship-004: Kolkata → Ahmedabad   (Machinery, 350 kg, Pending, Medium Priority)
ship-005: Jaipur → Lucknow      (Retail, 85 kg, Ready-for-Dispatch, Low Priority)
ship-006: Surat → Indore        (Diamonds, 5.5 kg, In-Transit, Critical, High Value)
ship-007: Nagpur → Vadodara     (Food, 150 kg, In-Transit, High Priority)
ship-008: Goa → Kochi           (Spices, 180 kg, Delivered, Medium Priority)
```

### Vehicles (5 total)
```
veh-001: MH-02-AB-1234  (Truck, 10000 kg capacity, Driver: driver-001, Active)
veh-002: KA-05-CD-5678  (Truck, 12000 kg capacity, Driver: driver-002, Active)
veh-003: TN-09-EF-9012  (Van, 3000 kg capacity, Driver: driver-003, Active)
veh-004: MH-01-GH-3456  (Truck, 8000 kg capacity, Driver: driver-004, Inactive)
veh-005: GJ-04-IJ-7890  (Truck, 9500 kg capacity, Driver: driver-005, Active)
```

### Company
```
Company ID: comp-001
User ID:    user-001
```

---

## 🔌 QUICK START COMMAND

**All-in-one setup** (after MongoDB is running):

```powershell
cd "c:\Users\RESHMA B\Downloads\Logix"

# Terminal 1: Backend (already running)
# cd backend && node server.js

# Terminal 2: Insert test data
cd backend && node insert-real-test-data.js

# Terminal 3: Run API tests
cd backend && node test-nomadia-endpoints.js

# Terminal 4: Open frontend
# http://localhost:5000
```

---

## 🐛 TROUBLESHOOTING

### "MongoDB Connection Error: ECONNREFUSED"
**Solution**: Start MongoDB service first
```powershell
mongod --dbpath "C:\data\db"
```

### "Cannot insert duplicate keys"
**Solution**: Test data script clears old data automatically
```powershell
# Reset and reinserize
node insert-real-test-data.js
```

### "Backend not responding"
**Solution**: Verify backend is running on port 5000
```powershell
netstat -ano | findstr :5000
# Should show node.exe listening
```

### "Frontend shows blank pages"
**Solution**: Hard refresh browser (Ctrl+Shift+R)

---

## 📈 WHAT WORKS NOW

| Feature | Without MongoDB | With MongoDB |
|---------|-----------------|--------------|
| Backend serves on :5000 | ✅ | ✅ |
| API endpoints accessible | ✅ | ✅ |
| GPS tracking page loads | ✅ | ✅ |
| Real shipment data displays | ❌ Empty | ✅ 8 shipments |
| POD form works | ✅ In-memory | ✅ Persisted |
| Route optimization logic | ✅ Empty routes | ✅ Real grouping |
| Driver assignments | ✅ Empty | ✅ Real assignments |

---

## 🎯 NEXT STEPS

1. **Option A (Recommended)**: Install local MongoDB → Insert test data → Full testing
2. **Option B (Fast)**: Use MongoDB Atlas cloud → 5 minute setup → Remote data
3. **Option C (Demo only)**: Use current setup with empty database → Show UI structure

Choose the option that works best for your environment, then run the test suite!

---

**Created**: April 18, 2026  
**Status**: Backend + Frontend Ready | Database Awaiting Connection  
**Estimate**: 15 minutes to full real-data testing

