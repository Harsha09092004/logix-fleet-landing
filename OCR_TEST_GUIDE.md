# 🎯 OCR Upload Test - Run in 2nd Terminal Guide

## Quick Start (Run This Script)

Open a **2nd PowerShell terminal** and run:

```powershell
& "C:\Users\RESHMA B\Downloads\Logix\test_ocr_complete.ps1"
```

---

##  Step-by-Step Breakdown

If you want to run the commands manually (as per your original request), here's what to do in a 2nd terminal:

### Step 1: Login
```powershell
$loginBody = @{email="demo@freightflow.in"; password="demo1234"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
$token = $response.token
Write-Host "✅ Logged in. Token: $($token.Substring(0, 30))..." -ForegroundColor Green
```

### Step 2: Prepare headers
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "✅ Headers prepared" -ForegroundColor Green
```

### Step 3: Create or prepare test invoice
```powershell
# Using existing uploaded file (113KB JPG/PDF)
$testInvPath = "C:\temp\test_actual_upload.jpg"
Write-Host "✅ Test image: $(Split-Path $testInvPath -Leaf) ($(Get-Item $testInvPath).Length) bytes" -ForegroundColor Green
```

### Step 4: Upload for OCR
```powershell
Write-Host "📤 Uploading invoice..." -ForegroundColor Yellow

# Create multipart form manually
$boundary = "----PSFormBoundary$(Get-Random)"
$CRLF = "`r`n"

# Read file
$fileBytes = [System.IO.File]::ReadAllBytes($testInvPath)
$fileName = Split-Path $testInvPath -Leaf

# Build multipart body
$bodyParts = @()
$bodyParts += "--$boundary"
$bodyParts += "Content-Disposition: form-data; name=`"document`"; filename=`"$fileName`""
$bodyParts += "Content-Type: image/jpeg"
$bodyParts += ""

$headerBytes = [System.Text.Encoding]::UTF8.GetBytes(($bodyParts -join $CRLF) + $CRLF)
$footerBytes = [System.Text.Encoding]::UTF8.GetBytes($CRLF + "--$boundary--" + $CRLF)

$bodyBytes = New-Object byte[] ($headerBytes.Length + $fileBytes.Length + $footerBytes.Length)
[System.Buffer]::BlockCopy($headerBytes, 0, $bodyBytes, 0, $headerBytes.Length)
[System.Buffer]::BlockCopy($fileBytes, 0, $bodyBytes, $headerBytes.Length, $fileBytes.Length)
[System.Buffer]::BlockCopy($footerBytes, 0, $bodyBytes, $headerBytes.Length + $fileBytes.Length, $footerBytes.Length)

# Upload
$upload = Invoke-WebRequest -Uri "http://localhost:5000/api/ocr/upload" -Method Post `
    -Headers ($headers + @{"Content-Type"="multipart/form-data; boundary=$boundary"}) `
    -Body $bodyBytes -UseBasicParsing

$uploadResult = $upload.Content | ConvertFrom-Json
$jobId = $uploadResult.ocr_job_id

Write-Host "✅ Upload started: $jobId" -ForegroundColor Green
Write-Host "   Cost: $($uploadResult.cost)" -ForegroundColor Cyan
```

### Step 5: Wait and check status
```powershell
Write-Host "`n⏳ Waiting 8 seconds for OCR processing..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 6: Get results
$status = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/status/$jobId" -Headers $headers

Write-Host "`n✅ OCR Results:" -ForegroundColor Green
Write-Host "   Status: $($status.status)" -ForegroundColor Cyan
if ($status.extracted_fields) {
    Write-Host "   Vendor: $($status.extracted_fields.vendor_name)" -ForegroundColor White
    Write-Host "   Invoice #: $($status.extracted_fields.invoice_number)" -ForegroundColor White
    Write-Host "   Amount: ₹$($status.extracted_fields.amount)" -ForegroundColor White
}
if ($status.confidence) {
    Write-Host "   Confidence: $(([math]::Round($status.confidence * 100, 1)))%" -ForegroundColor Green
}
Write-Host "   Cost: $($status.cost)" -ForegroundColor Green
```

---

## ✅ What This Tests

| Feature | Status |
|---------|--------|
| **Authentication** | ✅ Working |
| **File Upload** (multipart/form-data) | ✅ Working |
| **OCR Job Creation** | ✅ Working |
| **Background Processing** | ✅ Working |
| **Status Tracking** | ✅ Working |
| **Fallback Extraction** | ✅ Working (for unsupported formats) |
| **Error Resilience** | ✅ Fixed (no more crashes) |

---

## 🎯 Where to Run

You have **2 options**:

### Option A: Run Complete Script (Recommended)
```powershell
# Open 2nd Terminal and run:
& "C:\Users\RESHMA B\Downloads\Logix\test_ocr_complete.ps1"
```

### Option B: Run Commands Manually
- Open Terminal 1: Backend is running (`node server.js`)
- Open Terminal 2: Copy-paste commands from "Step 1" through "Step 6" above
- Watch real-time OCR processing in Terminal 1!

---

## 📊 OCR Features Implemented

✅ **Free Tesseract.js OCR** - No API costs
✅ **Multi-language Support** - Hindi + English  
✅ **Automatic Extraction** - Vendor, Invoice #, Amount
✅ **Confidence Scoring** - 0-100% accuracy rating
✅ **Batch Processing** - Upload up to 50 files  
✅ **Error Recovery** - Fallback data for unsupported formats
✅ **Background Jobs** - Non-blocking async processing

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unable to connect" | Make sure Terminal 1 has server running: `node server.js` |
| Blank status fields | Wait 2-3 more seconds, then retry status check |
| "No file uploaded" | Check `$testInvPath` exists and is readable |
| PDF files show warnings | Tesseract.js needs images; convert PDF to JPG/PNG |

---

## 📝 Notes

- First OCR run may take 5-10 seconds to initialize Tesseract worker
- Backend is running in **in-memory mode** (no MongoDB connection)
- All processing is **free** - no third-party API charges
- Fallback extraction provides basic data if Tesseract fails

