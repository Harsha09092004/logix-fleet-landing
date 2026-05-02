# Real Invoice Testing & Collection Guide

**Goal**: Collect 5-10 real Indian freight invoices and validate OCR extraction accuracy  
**Timeline**: Week 1 (parallel to OCR launch)  
**Owner**: Customer Success team + Founder

---

## PART 1: HOW TO COLLECT REAL INVOICES

### Channel 1: Beta Customers (Easy!)

**Email Template:**
```
Subject: Help us improve OCR accuracy - Share a sample invoice

Hi [Customer Name],

We're launching OCR for freight invoices and want to make sure it works for YOUR 
specific invoice format.

Could you share 1-2 sample invoices (redacted for confidential info if needed)?
We'll:
- Test our OCR on them
- Show you the extraction results
- Fix any formatting issues we find

This helps ensure OCR works perfectly when you start using it.

Share via: [Dropbox link] or reply to this email with attachment

Thanks!
[Your name]
```

**Response tracking:**
- [ ] Sent to: _____ customers
- [ ] Received: _____ invoices
- [ ] Quality: Good/Bad (readable, clear text, etc.)

### Channel 2: LinkedIn Outreach

**Message to 3PL Operations Heads:**
```
Hi [Name],

Quick ask - I'm building OCR for freight invoices and want to test it on real 
Indian invoices before launch next week.

Would you be willing to share 1 sample invoice (can be anonymized)? Should only 
take 2 minutes to upload.

Why: We want to ensure our OCR works for your TCI/Allcargo/Delhivery format 
specifically.

Share here: [Dropbox link]

Thanks!
```

**Outreach:**
- [ ] Target list: 20-30 3PL operations heads
- [ ] Expected response rate: 20-30%
- [ ] Expected samples: 5-10 invoices

### Channel 3: WhatsApp Logistics Parks

**Message to logistics park community:**
```
🚚 URGENT REQUEST FOR TESTING

Hi all! We're launching FREE OCR for freight invoices next week and need help 
testing with real invoices.

Need: 2-3 sample TCI/Allcargo/your own invoices
Time: 2 minutes to upload
Reward: Free OCR access for 3 months when we launch

Upload here: [Dropbox link or Google Form]

Thanks! 🙏
```

**Distribution:**
- [ ] Nerul Logistics Park
- [ ] Chakan Logistics Park
- [ ] Kothrud Logistics Hub
- [ ] Expected: 10-20 responses, 5-10 unique invoice formats

### Channel 4: Direct Relationships

**Call key contacts:**
- TCI Express regional manager
- Allcargo franchise owner
- Delhivery partner
- Local shipper associations

**Script:**
> "I'm building an OCR system for freight invoices. Could you spare 5 minutes 
> to help us test? Just need you to upload 1-2 of your actual invoices so we 
> can optimize for your format specifically."

---

## PART 2: TESTING PROCESS

### Step 1: Prepare Invoice

**Anonymization (if needed):**
- [ ] Remove customer names (replace with "Customer A")
- [ ] Remove phone numbers
- [ ] Remove email addresses
- [ ] Keep: Company name, invoice formats, amounts, GST, dates, routes

**Quality check:**
- [ ] Is it readable? (not blurry, not folded)
- [ ] Can you read the text easily? (OCR will struggle if human can't read)
- [ ] Any handwritten sections? (hard for OCR)
- [ ] File format: JPEG/PNG preferred

### Step 2: Upload to System

**Using the frontend:**
1. Login as demo@freightflow.in / demo1234
2. Go to Invoices → **📸 Import OCR Data**
3. Select the invoice file
4. Wait for processing (5-10 seconds)
5. **Copy the console output** (Ctrl+Shift+J to open developer tools)

**Console output format (what you'll see):**
```
🔐 OCR Upload - Token: [token length]
📤 OCR Response Status: 202 Accepted
📥 Upload Response Data: {ocr_job_id: '...'}
🔍 Job ID: OCR-XXXXXXX
⏳ Polling status attempt 1/60...
... (polling iterations)
✅ OCR Completed! Result: {
  vendor_name: 'TCI EXPRESS',
  invoice_number: 'TCE-2024-123456',
  invoice_date: '15-04-2026',
  amount: '15000',
  ...
}
🔄 Auto-filling form with OCR data
📄 Invoice#: TCE-2024-123456
💰 Amount: ₹15000
📝 Notes: OCR Extracted (88% confidence)
✨ Form auto-fill complete
```

### Step 3: Record Results

**Create a spreadsheet with:**

| Invoice Source | File | Vendor (Expected) | Vendor (Extracted) | Invoice# (Expected) | Invoice# (Extracted) | Date (Expected) | Date (Extracted) | Amount (Expected) | Amount (Extracted) | Accuracy | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TCI Sample 1 | tci_inv_001.jpg | TCI Express | TCI EXPRESS | INV-001234 | INV-001234 | 15-04-2026 | 15-04-2026 | ₹15,000 | ₹15000 | 100% | Clear image ✅ |
| Allcargo Sample | allc_002.jpg | Allcargo | Allcargo | BILL-0456 | BILL0456 | 12-04-2026 | 12-04-2026 | ₹8,900 | ₹8900 | 90% | Slight invoice# format diff |

**Accuracy calculation:**
```
Field accuracy = (# of correctly extracted fields) / (total fields) × 100

Example:
- Vendor: ✅ Correct (1 point)
- Invoice#: ⚠️ Correct but different format (0.5 points)
- Date: ✅ Correct (1 point)
- Amount: ✅ Correct (1 point)
- Total: 3.5 / 4 = 87.5% accuracy
```

### Step 4: Analyze Results

**For each invoice, note:**
- ✅ What extracted correctly?
- ⚠️ What needs improvement?
- ❌ What failed completely?
- 💡 Pattern observed?

**Example findings:**
```
TCI Invoices (5 samples):
✅ Vendor name: 100% accuracy (always "TCI EXPRESS")
✅ Invoice #: 100% accuracy (consistent format: INV-XXXXXX)
⚠️ Amount: 80% accuracy (sometimes includes GST separately)
⚠️ Date: 90% accuracy (DD-MM-YYYY format usually correct)
💡 Pattern: TCI uses very consistent formatting across all invoices

Allcargo Invoices (3 samples):
✅ Vendor: 100% accurate
⚠️ Invoice #: 60% (sometimes "BILL-" sometimes "INV-", sometimes no prefix)
⚠️ Amount: 70% (sometimes net, sometimes with GST)
💡 Pattern: Allcargo has variable formatting; need flexible regex
```

---

## PART 3: IMPROVEMENT ACTIONS

### If Accuracy > 90%
**Action**: ✅ SHIP IT - Ready for customer production

### If Accuracy 75-90%
**Action**: 🔧 TUNE regex patterns
1. Identify which format is failing
2. Add specific pattern to parseInvoiceText()
3. Re-test
4. If still <90%, mark as "known limitation"

### If Accuracy < 75%
**Action**: ⚠️ ESCALATE - May need:
- Different OCR engine (Tesseract training)
- Manual entry fallback
- Customer image quality guidelines
- Special handling for this vendor/format

---

## PART 4: COMMON ISSUES & FIXES

### Issue 1: Vendor name extracted but doesn't match dropdown

**Example:**
- Extracted: "TCI EXPRESS LOGISTICS PVT LTD"
- Dropdown has: "TCI Express"

**Solution:**
- Add fuzzy matching or substring match in frontend
- OR normalize vendor names in dropdown to match common variations
- OR ask customer to standardize dropdown

### Issue 2: Invoice number includes unwanted characters

**Example:**
- Expected: "INV-2024-00125"
- Extracted: "INV-2024-00125-A" (extra "A" at end)
- Or extracted: "INV-2024" (missing "-00125")

**Solution:**
- Improve regex pattern: `/(?:INV[#\s:-]*)([A-Z0-9\-\/\.]{5,20})/i`
- Test with this specific format
- Add customer guideline: "Keep invoice# clean (no extra characters)"

### Issue 3: Amount includes GST when it shouldn't

**Example:**
- Expected amount (net): ₹10,000
- Extracted amount (with GST): ₹11,800
- OCR picked up larger number

**Solution:**
- Look for "TOTAL AMOUNT" or "GRAND TOTAL" labels to distinguish
- OR ask customer to ensure main amount is clearly labeled
- OR add customer training: "Ensure invoice has clear 'Amount' field"

### Issue 4: Date format varies widely

**Examples:**
- Expected: "15-04-2026"
- Extracted variations: "15/04/2026", "15.04.2026", "2026-04-15"

**Solution:**
- Normalize all dates to DD-MM-YYYY in frontend
- Pattern already handles multiple formats - verify it's working
- Test: `/([0-3]?[0-9][\s\/\-.][0-1]?[0-9][\s\/\-.][12][0-9]{3})/`

### Issue 5: Route extraction fails completely

**Example:**
- Expected: "Mumbai → Delhi"
- Extracted: null

**Solution:**
- Routes often not clearly labeled in invoices
- Add customer guideline in FAQ: "Include 'Route: Origin - Destination'"
- Make route optional in form (not critical field)
- Fallback: Let user manually select

### Issue 6: Processing time > 10 seconds

**Cause:** Image too large, slow device

**Solution:**
- Compress image before upload (max 2MB)
- Show timeout message after 60 seconds
- Suggest: "Try a clearer, smaller image"

---

## PART 5: CUSTOMER DOCUMENTATION

### FAQ: What invoice format works best?

**✅ BEST:**
- Clear, printed invoice (not handwritten)
- High contrast (black text on white background)
- 1200x1600px or larger
- Main fields clearly labeled (Invoice #, Date, Amount, etc.)
- Example: TCI Express, Allcargo standard invoices

**🟡 OKAY:**
- Slightly blurry but still readable
- Small text but clear
- Colored background (as long as text visible)
- Some handwritten sections (OCR will skip them)

**❌ AVOID:**
- Heavily blurred or damaged images
- Faint text
- Entirely handwritten invoices
- Images smaller than 500x700px
- Screenshots with poor quality

### Troubleshooting Guide

**Q: OCR extracted wrong vendor name**
A: Check dropdown - it might be listed differently. Use "Select manually" and choose correct vendor.

**Q: Amount seems wrong**
A: OCR picked up a different number (maybe subtotal). Verify the actual invoice total and correct if needed.

**Q: Invoice # is incomplete or wrong**
A: Some invoice formats are unusual. Manually correct it - takes 5 seconds.

**Q: Processing took too long or timed out**
A: Try uploading a smaller, clearer image. Max file size: 5MB.

---

## PART 6: TRACKING TEMPLATE

### Weekly Testing Summary

**Week of: April 25-30, 2026**

| Date | Source | Invoices Tested | Avg Accuracy | Issues Found | Actions Taken |
|------|--------|---|---|---|---|
| 26-Apr | Beta customers | 3 | 92% | Vendor name case diff | Added lowercase matching |
| 27-Apr | LinkedIn outreach | 2 | 78% | Invoice# formatting | Improved regex |
| 28-Apr | WhatsApp parks | 4 | 85% | Amounts include GST | Added clarifying label |
| 29-Apr | TCI contact | 2 | 95% | None | Ready for production ✅ |
| 30-Apr | Allcargo contact | 1 | 88% | Route not extracted | Mark as optional, OK |
| TOTAL | | **12** | **88% avg** | 4 issues | 4 fixes deployed |

**Overall Assessment**: ✅ **READY TO LAUNCH**
- Average accuracy: 88% (target: ≥85%)
- All critical extractions working
- Minor issues documented + fixed
- Customer feedback: Positive
- Recommendation: **Proceed with GA (General Availability) launch**

---

## PART 7: LAUNCH READINESS

Check when ready:

- [ ] Collected 5+ real invoices
- [ ] Tested all invoices through system
- [ ] Average accuracy ≥ 85%
- [ ] All critical fields extracting correctly
- [ ] Documented known limitations
- [ ] Created customer guidelines/FAQ
- [ ] Team confident with results
- [ ] Received positive customer feedback

**Status**: ✅ Ready for customer outreach and Phase 2 Rate Card launch

