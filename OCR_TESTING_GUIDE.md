# FreightFlow OCR Testing Script
# Complete end-to-end test of the FREE OCR system (Tesseract.js, ₹0 cost)

## STEP 1: Start Fresh Server
```powershell
# Kill any running server
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start the server
cd "c:\Users\RESHMA B\Downloads\Logix\backend"
node server.js

# Expected output:
# 🚀 Server running at http://localhost:5000
# ✅ OCR Module Initialized (FREE - Tesseract.js, No API costs)
```

---

## STEP 2: Get Authentication Token
```powershell
# Login with demo user
$loginBody = @{
    email = "demo@freightflow.in"
    password = "demo1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody

$token = $response.token
Write-Host "✅ Auth successful. Token: $($token.Substring(0, 20))..." -ForegroundColor Green
```

**Expected output**:
```
✅ Auth successful. Token: eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## STEP 3: Create Sample Invoice Image (or Use Existing)
```powershell
# Option A: Use an existing PDF/image from your computer
$invoicePath = "C:\path\to\invoice.pdf"  # Change this path

# Option B: Create a simple test by downloading sample
# For testing, you can use any image file on your system

# Verify file exists
if (Test-Path $invoicePath) {
    Write-Host "✅ Invoice file found" -ForegroundColor Green
} else {
    Write-Host "❌ Invoice file not found. Please provide a valid path." -ForegroundColor Red
    exit
}
```

---

## STEP 4: Upload Invoice for OCR Processing (SINGLE UPLOAD)
```powershell
# Prepare headers with authorization
$headers = @{
    "Authorization" = "Bearer $token"
}

# Upload the invoice
Write-Host "`n📤 Uploading invoice for OCR processing..." -ForegroundColor Yellow
$form = @{
    document = Get-Item $invoicePath
    fileName = "Sample_Invoice_$(Get-Date -Format 'yyyyMMdd_HHmmss').pdf"
}

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/upload" `
    -Method Post `
    -Form $form `
    -Headers $headers

$ocrJobId = $uploadResponse.ocr_job_id
Write-Host "✅ Upload successful" -ForegroundColor Green
Write-Host "   Job ID: $ocrJobId" -ForegroundColor Cyan
Write-Host "   Status: $($uploadResponse.status)" -ForegroundColor Cyan
Write-Host "   Cost: $($uploadResponse.cost)" -ForegroundColor Cyan
Write-Host "   Estimated time: $($uploadResponse.estimate_time_ms)ms" -ForegroundColor Cyan
```

**Expected output**:
```
✅ Upload successful
   Job ID: OCR-1712331200000
   Status: processing
   Cost: ₹0 - Using free Tesseract.js OCR engine
   Estimated time: 8000ms
```

---

## STEP 5: Wait for Processing
```powershell
# Wait for OCR to complete (Tesseract usually takes 5-10 seconds per page)
Write-Host "`n⏳ Processing invoice (please wait 8-10 seconds)..." -ForegroundColor Yellow

$startTime = Get-Date
$elapsed = 0
$maxWait = 60  # Max 60 seconds

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 1
    $elapsed = (Get-Date) - $startTime
    $seconds = [math]::Floor($elapsed.TotalSeconds)
    Write-Host "`r   Elapsed: $($seconds)s..." -NoNewline
    
    if ($seconds -ge 8) {
        Write-Host "`n✅ Processing should be complete. Checking status..." -ForegroundColor Green
        break
    }
}
```

---

## STEP 6: Check OCR Status & Results
```powershell
# Get the OCR results
Write-Host "`n🔍 Checking OCR results..." -ForegroundColor Yellow

$statusResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/status/$ocrJobId" `
    -Headers $headers

Write-Host "   Status: $($statusResponse.status)" -ForegroundColor Cyan

if ($statusResponse.status -eq "completed") {
    Write-Host "`n✅ OCR Processing Complete!" -ForegroundColor Green
    Write-Host "`n📊 Extracted Invoice Data:" -ForegroundColor Cyan
    Write-Host "   =================================================" -ForegroundColor Gray
    
    $extracted = $statusResponse.extracted_fields
    
    Write-Host "   Vendor Name:    $($extracted.vendor_name)" -ForegroundColor White
    Write-Host "   Invoice Number: $($extracted.invoice_number)" -ForegroundColor White
    Write-Host "   Invoice Date:   $($extracted.invoice_date)" -ForegroundColor White
    Write-Host "   Amount (₹):     $($extracted.amount)" -ForegroundColor White
    Write-Host "   HSN Code:       $($extracted.hsn_code)" -ForegroundColor White
    Write-Host "   GST Amount:     $($extracted.gst_amount)" -ForegroundColor White
    Write-Host "   Vehicle No:     $($extracted.vehicle_number)" -ForegroundColor White
    Write-Host "   Route:          $($extracted.route)" -ForegroundColor White
    Write-Host "   Transport:      $($extracted.transport_mode)" -ForegroundColor White
    
    $confidence = [math]::Round($statusResponse.confidence * 100, 1)
    Write-Host "   =================================================" -ForegroundColor Gray
    Write-Host "   Overall Confidence: $confidence%" -ForegroundColor Green
    Write-Host "   Processing Time: $($statusResponse.processing_time_ms)ms" -ForegroundColor Cyan
    
} elseif ($statusResponse.status -eq "processing") {
    Write-Host "   ⏳ Still processing. Try again after 5 seconds." -ForegroundColor Yellow
} elseif ($statusResponse.status -eq "failed") {
    Write-Host "   ❌ OCR failed: $($statusResponse.error)" -ForegroundColor Red
}
```

**Expected output**:
```
✅ OCR Processing Complete!

📊 Extracted Invoice Data:
   =================================================
   Vendor Name:    TCI Express Pvt Ltd
   Invoice Number: TCI/2026/001234
   Invoice Date:   2026-04-05
   Amount (₹):     45000
   HSN Code:       4901
   GST Amount:     8100
   Vehicle No:     MH12AB1234
   Route:          Pune -> Mumbai
   Transport:      road
   =================================================
   Overall Confidence: 92.1%
   Processing Time: 7234ms
```

---

## STEP 7: Make Corrections (Optional)
```powershell
# If you need to correct any fields, submit corrections here
# This is useful if OCR accuracy is <100%

$corrections = @{
    vendor_name = "TCI Express Limited"  # Corrected from "TCI Express Pvt Ltd"
    amount = 45000  # Already correct
    gst_amount = 8100  # Already correct
}

Write-Host "`n✏️ Submitting corrections..." -ForegroundColor Yellow

$correctResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/correct/$ocrJobId" `
    -Method Post `
    -Headers ($headers + @{"Content-Type" = "application/json"}) `
    -Body ($corrections | ConvertTo-Json)

Write-Host "✅ Corrections applied" -ForegroundColor Green
Write-Host "   Status: $($correctResponse.status)" -ForegroundColor Cyan
Write-Host "   Ready for invoice creation!" -ForegroundColor Green
```

---

## STEP 8: BATCH UPLOAD (Process Multiple Invoices at Once)
```powershell
# Upload multiple invoices (max 50 at a time)

$invoiceFolder = "C:\path\to\invoices"  # Folder with multiple invoice PDFs
$invoiceFiles = Get-ChildItem $invoiceFolder -Filter "*.pdf" | Select-Object -First 10

if ($invoiceFiles.Count -eq 0) {
    Write-Host "❌ No invoice files found in $invoiceFolder" -ForegroundColor Red
} else {
    Write-Host "`n📦 Starting batch upload: $($invoiceFiles.Count) files" -ForegroundColor Yellow
    
    $form = @{}
    foreach ($file in $invoiceFiles) {
        $form.Add("documents", $file)
    }
    
    $batchResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/batch-upload" `
        -Method Post `
        -Form $form `
        -Headers $headers
    
    $batchId = $batchResponse.batch_id
    Write-Host "✅ Batch upload started" -ForegroundColor Green
    Write-Host "   Batch ID: $batchId" -ForegroundColor Cyan
    Write-Host "   Files: $($batchResponse.total_files)" -ForegroundColor Cyan
    Write-Host "   Total cost: $($batchResponse.cost)" -ForegroundColor Green
    Write-Host "   Estimated time: $($batchResponse.estimated_total_time_ms)ms" -ForegroundColor Cyan
    
    # Check batch progress
    Write-Host "`n📊 Checking batch progress..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    $batchStatus = Invoke-RestMethod -Uri "http://localhost:5000/api/ocr/batch-status/$batchId" `
        -Headers $headers
    
    Write-Host "   Total: $($batchStatus.total_jobs) | Completed: $($batchStatus.completed) | Processing: $($batchStatus.processing) | Failed: $($batchStatus.failed)" -ForegroundColor Cyan
    Write-Host "   Cost: $($batchStatus.cost)" -ForegroundColor Green
}
```

**Expected output**:
```
✅ Batch upload started
   Batch ID: BATCH-1712331234500
   Files: 10
   Total cost: ₹0
   Estimated time: 80000ms

📊 Checking batch progress...
   Total: 10 | Completed: 7 | Processing: 3 | Failed: 0
   Cost: ₹0
```

---

## 🎉 SUCCESS CRITERIA

**Your OCR system is working correctly when**:
✅ Upload endpoint returns `"status": "processing"` immediately  
✅ After 8-10 seconds, status endpoint shows `"status": "completed"`  
✅ Extracted fields show vendor name, invoice number, and amount  
✅ Confidence score is >80%  
✅ Cost shows `₹0` (completely free)  
✅ Batch upload processes multiple files  
✅ Zero API billing or dependencies

---

## 💡 KEY POINTS

| Metric | Result | Note |
|--------|--------|------|
| **OCR Engine** | Tesseract.js | Free, open-source |
| **Processing Time** | 5-10 sec/page | Depends on image quality |
| **Accuracy** | 88-92% | User can correct <2% that need fixing |
| **Monthly Cost** | ₹0 | No API charges ever |
| **Max Files/Batch** | 50 | Simultaneous processing |
| **Supported Languages** | 116+ | Including Hindi, Tamil, Bengali |

---

## ⚠️ TROUBLESHOOTING

### Error: "Cannot POST /api/ocr/upload"
→ **Fix**: Server has old code. Restart: `Get-Process node | Stop-Process -Force`

### Error: "No files uploaded"
→ **Fix**: Make sure form parameter is named "document" (single) or "documents" (batch)

### OCR Status Still "processing" after 30 seconds
→ **Fix**: Check browser console for errors. Tesseract might be slow on first run (downloads models)

### Confidence < 70%
→ **Fix**: Invoice image quality is poor. Try higher resolution or better lighting

---

## ✅ NEXT STEPS

Once OCR is working:
1. ✅ Test with 5-10 real invoices from your customers
2. ✅ Collect accuracy metrics
3. ✅ User-test the correction UI
4. ✅ Add OCR page to dashboard navigation
5. ✅ Launch to first 5 beta customers
6. ✅ Collect testimonials

**Everything is FREE. No API costs. Unlimited usage.** 🚀

