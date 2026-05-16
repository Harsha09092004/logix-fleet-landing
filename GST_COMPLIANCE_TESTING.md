# FreightFlow: GST Compliance & Reconciliation Testing Guide

**Phase:** 3.11 | **Status:** Ready for Implementation | **Target:** Complete by June 1, 2026

---

## 🎯 **Executive Overview**

GST (Goods & Services Tax) accuracy is critical for Indian businesses:
- Compliance with GST Act, 2017
- GSTR-1 filing accuracy (monthly)
- Tax audit preparedness
- Client confidence: "Your numbers are always correct"

**Testing Scope:**
- ✅ GST rate extraction (5%, 12%, 18%, 28%)
- ✅ HSN/SAC code validation
- ✅ IGST vs CGST/SGST calculation
- ✅ Composite supply handling
- ✅ Reverse charge mechanism
- ✅ Supply type classification (B2B, B2C, SEZ)
- ✅ Invoice value verification

---

## 📋 **Part 1: GST Test Data Preparation**

### GST Scenarios to Test

```
1. Standard Invoices (15 samples)
├── Single GST rate (18%)
├── Multiple line items
├── Clear GST breakdowns
├── Intra-state supply (CGST + SGST)
└── Inter-state supply (IGST)

2. Complex GST (10 samples)
├── Multiple GST rates (5%, 12%, 18%, 28%)
├── Mixed items on single invoice
├── Discounts with GST impact
├── Composite supplier invoices
└── Exempt supplies

3. Edge Cases (8 samples)
├── ₹0 GST (exempt items)
├── Reverse charge (GST payable by buyer)
├── SEZ supplies
├── Supply to overseas (0% GST)
├── Zero-rated supplies

4. Error Scenarios (7 samples)
├── GST amount doesn't match rate
├── Missing GST details
├── Incorrect HSN code
├── Invalid GSTIN format
└── Misclassified supply type
```

### GST Test Spreadsheet

**Template: `gst-test-matrix.csv`**

```csv
TestID,FileName,InvoiceType,SupplyType,ItemDescription,HSNCode,Amount,Rate%,ExpectedGST,ExtractedGST,Match,Status
GST-001,standard-sgst-igst.pdf,Standard,Intra-State,Office Supplies,4820,₹10000,18%,₹3240(CGST₹1620+SGST₹1620),₹3240(CGST₹1620+SGST₹1620),✅,✅ PASS
GST-002,standard-inter-state.pdf,Standard,Inter-State,Software Services,998300,₹50000,18%,₹9000(IGST),₹9000(IGST),✅,✅ PASS
GST-003,mixed-rates.pdf,Complex,Mixed,Multiple Items,Various,"₹5000 (5%), ₹8000 (12%), ₹10000 (18%)",Various,"₹250 + ₹960 + ₹1800 = ₹3010","₹250 + ₹960 + ₹1800 = ₹3010",✅,✅ PASS
GST-004,exempt-supply.pdf,Complex,B2B,Exempt Item (Books),4901,₹5000,0%,₹0,₹0,✅,✅ PASS
GST-005,reverse-charge.pdf,EdgeCase,B2B,Services (RC),998300,₹25000,18%,"₹0 (RC - Payee GST)","₹0 (RC - Payee GST)",✅,✅ PASS
...
```

---

## ✅ **Part 2: GST Rate Accuracy Testing**

### Test 1: GST Rate Extraction

```javascript
const testGSTRateExtraction = async (invoiceFile) => {
  const result = await ocrService.process(invoiceFile);
  
  // Test rates: 0%, 5%, 12%, 18%, 28%
  const validRates = [0, 5, 12, 18, 28];
  
  result.lineItems.forEach((item) => {
    // Verify rate is valid
    expect(validRates).toContain(item.gstRate);
    
    // Verify rate matches item type
    if (item.description.includes('Books')) {
      expect(item.gstRate).toBe(0);  // Books are exempt
    } else if (item.description.includes('Services')) {
      expect([5, 12, 18]).toContain(item.gstRate);  // Services typically 5-18%
    } else if (item.description.includes('Luxury')) {
      expect(item.gstRate).toBe(28);  // Luxury goods 28%
    }
  });
};
```

### Test 2: IGST vs CGST/SGST Calculation

```javascript
const testIGSTvsCGST_SGST = async () => {
  // Test case 1: Intra-state (CGST + SGST)
  const intraStateInvoice = await ocrService.process('intra-state.pdf');
  
  // Should use CGST + SGST
  intraStateInvoice.lineItems.forEach(item => {
    const cgst = item.amount * (item.gstRate / 100) / 2;
    const sgst = item.amount * (item.gstRate / 100) / 2;
    
    expect(Math.abs(item.cgst - cgst)).toBeLessThan(1);
    expect(Math.abs(item.sgst - sgst)).toBeLessThan(1);
    expect(item.igst).toBe(0);
  });
  
  // Test case 2: Inter-state (IGST only)
  const interStateInvoice = await ocrService.process('inter-state.pdf');
  
  // Should use IGST
  interStateInvoice.lineItems.forEach(item => {
    const igst = item.amount * (item.gstRate / 100);
    
    expect(Math.abs(item.igst - igst)).toBeLessThan(1);
    expect(item.cgst).toBe(0);
    expect(item.sgst).toBe(0);
  });
};
```

### Test 3: Total GST Verification

```javascript
const testTotalGSTVerification = async (invoiceFile) => {
  const result = await ocrService.process(invoiceFile);
  
  // Calculate total GST from line items
  let calculatedTotalGST = 0;
  result.lineItems.forEach(item => {
    calculatedTotalGST += item.cgst || 0;
    calculatedTotalGST += item.sgst || 0;
    calculatedTotalGST += item.igst || 0;
  });
  
  // Compare with invoice total tax
  expect(Math.abs(calculatedTotalGST - result.totalTax)).toBeLessThan(1);
  
  // Verify invoice total = subtotal + GST
  const expectedTotal = result.subtotal + result.totalTax;
  expect(Math.abs(expectedTotal - result.grandTotal)).toBeLessThan(1);
};
```

---

## 🏦 **Part 3: HSN/SAC Code Testing**

### Test 4: HSN Code Extraction & Validation

```javascript
const testHSNCodeExtraction = async () => {
  const testCases = [
    {
      description: 'Office Stationery',
      expectedHSN: '4820',
      gstRate: 18
    },
    {
      description: 'Software Services',
      expectedHSN: '998300',
      gstRate: 18
    },
    {
      description: 'Computer Hardware',
      expectedHSN: '8471',
      gstRate: 12
    },
    {
      description: 'Transportation Services',
      expectedHSN: '996312',
      gstRate: 5
    }
  ];
  
  for (const testCase of testCases) {
    const invoice = await createTestInvoice(testCase);
    const result = await ocrService.process(invoice);
    
    // HSN should be extracted
    expect(result.lineItems[0].hsnCode).toBeDefined();
    expect(result.lineItems[0].hsnCode).toBe(testCase.expectedHSN);
    
    // Rate should match HSN classification
    expect(result.lineItems[0].gstRate).toBe(testCase.gstRate);
  }
};
```

### Test 5: SAC Code (Services)

```javascript
const testSACCodeExtraction = async () => {
  const serviceInvoice = await ocrService.process('services-invoice.pdf');
  
  serviceInvoice.lineItems.forEach(item => {
    if (item.type === 'SERVICE') {
      // Should have SAC instead of HSN
      expect(item.sacCode).toBeDefined();
      expect(item.sacCode.length).toBe(6);  // SAC is 6 digits
      
      // Common SAC codes
      const validSAC = ['998300', '998301', '999901', '999902'];
      expect(validSAC).toContain(item.sacCode);
    }
  });
};
```

---

## 🔍 **Part 4: Reverse Charge & Special Cases**

### Test 6: Reverse Charge Mechanism

```javascript
const testReverseCharge = async () => {
  // When GST is payable by recipient (reverse charge)
  const rcInvoice = await ocrService.process('reverse-charge-invoice.pdf');
  
  // GST should be 0 on invoice (payable by buyer)
  expect(rcInvoice.totalTax).toBe(0);
  
  // Should be marked as reverse charge
  expect(rcInvoice.reverseChargeApplicable).toBe(true);
  
  // GST amount should still be calculated for buyer's records
  expect(rcInvoice.rcGSTAmount).toBeGreaterThan(0);
};
```

### Test 7: SEZ & Export Supplies

```javascript
const testSEZAndExportSupplies = async () => {
  // SEZ supply (0% GST)
  const sezInvoice = await ocrService.process('sez-supply.pdf');
  expect(sezInvoice.lineItems[0].gstRate).toBe(0);
  expect(sezInvoice.supplyType).toBe('SEZ');
  
  // Export supply (0% GST)
  const exportInvoice = await ocrService.process('export-invoice.pdf');
  expect(exportInvoice.lineItems[0].gstRate).toBe(0);
  expect(exportInvoice.supplyType).toBe('EXPORT');
};
```

### Test 8: Composite Suppliers

```javascript
const testCompositeSupplier = async () => {
  // Composite suppliers file GST at flat 1%, 2%, or 5%
  const compositeInvoice = await ocrService.process('composite-supplier.pdf');
  
  // Should identify as composite
  expect(compositeInvoice.supplierType).toBe('COMPOSITE');
  
  // GST rate should be 1%, 2%, or 5%
  expect([1, 2, 5]).toContain(compositeInvoice.gstRate);
};
```

---

## 📊 **Part 5: GSTR Compliance Testing**

### Test 9: GSTR-1 Data Format

```javascript
const testGSTR1Format = async () => {
  const invoices = await ocrService.processBatch('batch-10-invoices');
  
  // Create GSTR-1 format output
  const gstr1Data = {
    b2b: [],  // B2B invoices
    b2c: [],  // B2C invoices
    nil: [],  // Nil/Exempt invoices
    exp: [],  // Export invoices
    de: []    // Debit/Credit notes
  };
  
  invoices.forEach(invoice => {
    const record = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      suppliersGSTIN: invoice.supplierGSTIN,
      invoiceValue: invoice.grandTotal,
      taxAmount: invoice.totalTax,
      taxRate: invoice.lineItems[0].gstRate,
      recipientGSTIN: invoice.recipientGSTIN || ''
    };
    
    if (invoice.supplyType === 'B2B') {
      gstr1Data.b2b.push(record);
    } else if (invoice.supplyType === 'B2C') {
      gstr1Data.b2c.push(record);
    } else if (invoice.supplyType === 'EXPORT') {
      gstr1Data.exp.push(record);
    }
  });
  
  // Validate structure
  expect(gstr1Data.b2b.length).toBeGreaterThan(0);
  gstr1Data.b2b.forEach(record => {
    expect(record.recipientGSTIN).toMatch(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z]{1}$/);
  });
};
```

### Test 10: Tax Invoice Requirements

```javascript
const testTaxInvoiceRequirements = async (invoiceFile) => {
  const result = await ocrService.process(invoiceFile);
  
  // All mandatory fields for valid tax invoice
  const mandatoryFields = [
    'invoiceNumber',
    'invoiceDate',
    'supplierName',
    'supplierGSTIN',
    'recipientName',
    'lineItems',
    'totalTax',
    'grandTotal',
    'suppliersSignature'
  ];
  
  mandatoryFields.forEach(field => {
    expect(result[field]).toBeDefined();
    expect(result[field]).not.toBe('');
  });
  
  // Verify GSTIN format (15 digits)
  expect(result.supplierGSTIN).toMatch(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z]{1}$/);
};
```

---

## 🧪 **Part 6: Discrepancy Detection**

### Test 11: Auto-Flag Discrepancies

```javascript
const testDiscrepancyDetection = async (invoiceFile) => {
  const result = await ocrService.process(invoiceFile);
  
  const discrepancies = [];
  
  // Check 1: Invoice amount mismatch
  let lineItemTotal = 0;
  result.lineItems.forEach(item => {
    lineItemTotal += item.quantity * item.unitPrice;
  });
  if (Math.abs(lineItemTotal - result.subtotal) > 1) {
    discrepancies.push({
      type: 'AMOUNT_MISMATCH',
      severity: 'HIGH',
      message: `Line items total ₹${lineItemTotal} but subtotal is ₹${result.subtotal}`
    });
  }
  
  // Check 2: GST calculation error
  let calculatedGST = 0;
  result.lineItems.forEach(item => {
    const itemGST = (item.quantity * item.unitPrice) * (item.gstRate / 100);
    calculatedGST += itemGST;
  });
  if (Math.abs(calculatedGST - result.totalTax) > 1) {
    discrepancies.push({
      type: 'GST_CALCULATION_ERROR',
      severity: 'CRITICAL',
      message: `Calculated GST ₹${calculatedGST} but invoice shows ₹${result.totalTax}`
    });
  }
  
  // Check 3: HSN/SAC compliance
  result.lineItems.forEach((item, index) => {
    if (!item.hsnCode && !item.sacCode) {
      discrepancies.push({
        type: 'MISSING_HSN_SAC',
        severity: 'MEDIUM',
        message: `Line item ${index + 1} missing HSN/SAC code`,
        lineItem: index
      });
    }
  });
  
  // Check 4: GSTIN format
  if (result.supplierGSTIN && !result.supplierGSTIN.match(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z]{1}$/)) {
    discrepancies.push({
      type: 'INVALID_GSTIN',
      severity: 'CRITICAL',
      message: `Invalid supplier GSTIN format: ${result.supplierGSTIN}`
    });
  }
  
  return discrepancies;
};
```

---

## ✅ **Part 7: GST Testing Checklist**

**Phase 1: Test Data (Day 1)**
- [ ] 40 test invoices prepared
- [ ] GST scenarios covered: Standard, Complex, Edge cases, Errors
- [ ] Expected values documented
- [ ] Test matrix created

**Phase 2: Basic GST Testing (Days 2)**
- [ ] GST rate extraction: 99%+ accuracy
- [ ] IGST vs CGST/SGST: Correct classification
- [ ] Total GST verification: 100% accurate
- [ ] HSN/SAC codes: Correctly extracted

**Phase 3: Compliance Testing (Day 3)**
- [ ] Reverse charge: Correctly handled
- [ ] SEZ/Export: 0% GST correctly applied
- [ ] Composite suppliers: Identified
- [ ] GSTR-1 format: Correct structure

**Phase 4: Validation (Day 3)**
- [ ] Discrepancies detected: All flagged
- [ ] False positives: < 2%
- [ ] Manual review flagged: Complex cases
- [ ] Compliance score: 98%+

**Phase 5: Integration Testing (Day 4)**
- [ ] Dashboard shows GST correctly
- [ ] Export to GSTR format: Works
- [ ] Bulk processing: Consistent accuracy
- [ ] Error handling: Graceful failures

**Phase 6: Audit Preparation (Day 4)**
- [ ] GST reports generated
- [ ] Tax audit trail complete
- [ ] Compliance documentation ready
- [ ] Go-live approval obtained

---

## 📊 **GST Testing Report Template**

**File: `gst-compliance-report.md`**

```markdown
# GST Compliance & Testing Report

**Date:** May 22, 2026  
**Test Duration:** 3 days  
**Sample Size:** 40 invoices  
**Status:** ✅ PRODUCTION READY

## GST Accuracy Results

| Test Category | Target | Actual | Status |
|--------------|--------|--------|--------|
| GST Rate Extraction | 99% | 99.5% | ✅ PASS |
| IGST vs CGST/SGST | 98% | 99% | ✅ PASS |
| Total Tax Calculation | 99% | 99.2% | ✅ PASS |
| HSN/SAC Code | 95% | 97.5% | ✅ PASS |
| GSTR-1 Format | 98% | 98.8% | ✅ PASS |
| Overall Compliance | 97% | 98.4% | ✅ PASS |

## Discrepancy Detection

**Correctly Flagged:**
- Amount mismatches: 5/5 (100%)
- GST errors: 4/4 (100%)
- Invalid GSTIN: 3/3 (100%)
- Missing HSN/SAC: 6/6 (100%)

**False Positives:** 0
**False Negatives:** 0

## Scenario Coverage

✅ Standard invoices: 15/15 passed  
✅ Complex GST: 10/10 passed  
✅ Edge cases: 8/8 passed  
✅ Error scenarios: 7/7 correctly identified  

## Regulatory Compliance

✅ GST Act, 2017 compliance verified  
✅ GSTR-1 filing format correct  
✅ HSN/SAC classification accurate  
✅ Reverse charge handling correct  
✅ Invoice validation complete  

## Recommendation

**✅ READY FOR PRODUCTION**

All GST compliance tests passed. System accurately extracts and validates tax information. Suitable for tax filing and audit purposes.

---

Signed: Ganesh Kumar  
Date: May 22, 2026  
Verified by: Tax Consultant, CA Sharma
```

---

## 📚 **Resources**

- **GST Act, 2017:** https://www.cbic.gov.in/
- **GSTR-1 Format:** https://www.gst.gov.in/
- **HSN/SAC Codes:** https://www.cbic.gov.in/gst-goods-services-tax-rates
- **GSTR Filing:** https://www.gst.gov.in/gsttraining/

---

**Owner:** Ganesh Kumar  
**Duration:** 2-3 days (Phase 3.11)  
**Status:** Ready for Implementation  
**Last Updated:** May 16, 2026
