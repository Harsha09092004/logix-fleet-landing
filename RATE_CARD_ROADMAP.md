# Rate Card Feature Roadmap (Phase 2: Week 4-6)

**Objective**: Enable mid-market 3PLs to build and manage dynamic freight rate cards  
**Target Customers**: 25-40 3PL companies  
**Expected Revenue**: ₹25-35L MRR by end of Phase 2

---

## PART 1: FEATURE OVERVIEW

### What is a Rate Card?
A rate card is a **pricing matrix** that 3PLs use to quote freight rates to shippers based on:
- Origin & destination
- Commodity type
- Weight/volume
- Transport mode (Road, Rail, Air)
- Urgency (Express, Standard, Economy)

### Current Problem
- 3PLs manage rates in Excel (unsearchable, version chaos)
- Rates vary by customer, region, season
- Quoting is manual (15-30 min per quote)
- Rate changes are slow to propagate

### FreightFlow Solution
- **Digital Rate Card Builder** - Drag-n-drop or bulk upload
- **Instant Quotation** - API returns quote in <1 second
- **Rate Versioning** - Track historical rates
- **Customer-specific rates** - Different pricing per customer
- **Analytics** - Which routes are profitable?

---

## PART 2: TECHNICAL ARCHITECTURE

### Database Schema

```javascript
// Collections needed:
1. ff_rate_cards
   - card_id (PK)
   - company_id (FK)
   - name: "Mumbai-Delhi Route Card"
   - status: "active" | "draft" | "archived"
   - is_default: true/false
   - created_by: user_id
   - created_at, updated_at
   - rate_table: [] // Array of rate entries

2. ff_rate_table_entries
   - entry_id (PK)
   - card_id (FK)
   - origin: "Mumbai"
   - destination: "Delhi"
   - transport_mode: "road" | "rail" | "air"
   - commodity_type: "General" | "Electronics" | "FMCG"
   - min_weight: 100
   - max_weight: 5000
   - base_rate: 5000
   - rate_per_kg: 2.5
   - rate_per_km: 20
   - gst_percentage: 18
   - urgency_surcharge: 1.1 // 1.0 = standard, 1.1 = 10% express premium
   - active: true
   - created_at, updated_at

3. ff_quotes (for analytics)
   - quote_id (PK)
   - company_id (FK)
   - card_id (FK)
   - customer_id / shipper_name
   - origin, destination
   - weight, volume
   - quoted_rate
   - accepted: true/false
   - conversion: true/false (quote → actual shipment)
   - created_at
```

### API Endpoints (New)

```
POST   /api/rate-cards              → Create new rate card
GET    /api/rate-cards              → List all rate cards for user's company
GET    /api/rate-cards/:cardId      → Get single rate card with all entries
PUT    /api/rate-cards/:cardId      → Update rate card (name, status)
DELETE /api/rate-cards/:cardId      → Archive rate card

POST   /api/rate-cards/:cardId/entries      → Add rate entries (bulk)
PUT    /api/rate-cards/:cardId/entries/:entryId → Update single entry
DELETE /api/rate-cards/:cardId/entries/:entryId → Delete single entry

POST   /api/quotes/generate         → Calculate quote using rate card
GET    /api/quotes/analytics        → Quote acceptance rate, conversion %

IMPORT /api/rate-cards/import       → Bulk import from CSV/Excel
EXPORT /api/rate-cards/:cardId/export → Download as CSV/Excel
```

---

## PART 3: FRONTEND FEATURES

### Feature 1: Rate Card Builder

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ Rate Cards                          [+ New] │
├─────────────────────────────────────────────┤
│ Card Name              | Type    | Routes  │
├─────────────────────────────────────────────┤
│ Mumbai-Delhi (Active) │ Default │ 2 entry│ ← Click to edit
│ North India v2.1      │ Draft   │ 45     │
│ Seasonal Rates (Old)  │ Archive │ 18     │
└─────────────────────────────────────────────┘

On click → Opens Rate Table Editor:

┌────────────────────────────────────────────────────────────┐
│ RATE TABLE: Mumbai-Delhi Routes              [+ Add Row]  │
├────────────────────────────────────────────────────────────┤
│ From  │ To    │ Mode │ Commodity │ Min Wt │ Rate  │ GST %│
├────────────────────────────────────────────────────────────┤
│ Mum   │ Delhi │ Road │ General   │ 500    │ 5000  │ 18  │
│ Mum   │ Delhi │ Road │ Elec.     │ 500    │ 6500  │ 18  │
│ Mum   │ Delhi │ Air  │ General   │ 200    │ 12000 │ 18  │
└────────────────────────────────────────────────────────────┘
```

### Feature 2: Bulk Import / Export

**CSV Format:**
```csv
origin,destination,mode,commodity,min_weight,max_weight,base_rate,rate_per_kg,urgency_surcharge
Mumbai,Delhi,Road,General,500,5000,5000,2.5,1.0
Mumbai,Delhi,Road,Electronics,200,2000,6500,3.0,1.1
Mumbai,Bangalore,Road,General,1000,10000,4500,2.0,1.0
```

**Actions:**
- [ ] Download template CSV
- [ ] Upload CSV → Bulk import 100+ routes at once
- [ ] Export current rate card as CSV/Excel
- [ ] Version history (revert to old rate card)

### Feature 3: Quote Calculator

**UI:**
```
┌─────────────────────────────────────────────┐
│ 📊 Get Instant Quote                        │
├─────────────────────────────────────────────┤
│ Select Rate Card: [Mumbai-Delhi v2.1 ▼]    │
│                                             │
│ From: [Mumbai ▼]    To: [Delhi ▼]         │
│ Transport Mode: [Road ▼]                   │
│ Commodity: [General ▼]                     │
│ Weight: [2000 kg]                          │
│ Urgency: [Standard ▼]                      │
│                                             │
│              [Calculate Quote]              │
│                                             │
│ 💰 BASE RATE:        ₹5,000                │
│ 💰 WEIGHT CHARGE:    ₹5,000 (2000 kg @ 2.5)
│ 💰 EXPRESS PREMIUM:  ₹0                    │
│ ─────────────────────────────────────────  │
│ 💰 SUBTOTAL:         ₹10,000               │
│ 🧾 GST 18%:          ₹1,800                │
│ ═════════════════════════════════════════  │
│ 💰 TOTAL:            ₹11,800               │
│                                             │
│ [Share Quote] [Accept] [Save as Draft]     │
└─────────────────────────────────────────────┘
```

### Feature 4: Analytics Dashboard

**Metrics:**
- Quote-to-Shipment conversion rate
- Average quote value
- Most quoted routes
- Acceptance rate by customer
- Profitability analysis (cost vs rate)

---

## PART 4: IMPLEMENTATION ROADMAP

### Week 4: Backend Development

**Day 1-2: Database & Models**
- [ ] Create MongoDB collections (ff_rate_cards, ff_rate_table_entries)
- [ ] Write Mongoose schemas
- [ ] Add company_id foreign key (multi-company isolation)
- [ ] Add audit logging (who created/modified rates)

**Day 3-4: API Endpoints**
- [ ] POST /api/rate-cards → Create
- [ ] GET /api/rate-cards → List all (filtered by company)
- [ ] POST /api/rate-cards/:cardId/entries → Bulk add entries
- [ ] POST /api/quotes/generate → Calculate quote (complex logic)

**Day 5: Quote Calculation Engine**
```javascript
calculateQuote(rateCard, shipment) {
  // Match shipment against rate_table_entries
  // 1. Filter by origin, destination, mode, commodity
  // 2. Match weight to min/max range
  // 3. Calculate: base_rate + (weight * rate_per_kg) + etc
  // 4. Apply urgency surcharge
  // 5. Calculate GST
  // 6. Return quote object with breakdown
}
```

### Week 5: Frontend Development

**Day 1-2: Rate Card Builder UI**
- [ ] Create rate-card listing page
- [ ] Build rate table editor (add/edit/delete rows)
- [ ] Implement inline editing
- [ ] Add create/edit forms

**Day 3: Import/Export**
- [ ] Download CSV template
- [ ] Bulk upload from CSV
- [ ] Export current card
- [ ] Version history UI

**Day 4: Quote Calculator**
- [ ] Build quote form with dropdowns
- [ ] Connect to /api/quotes/generate endpoint
- [ ] Show quote breakdown
- [ ] Add share/accept buttons

**Day 5: Analytics Dashboard**
- [ ] Query /api/quotes/analytics
- [ ] Show conversion metrics
- [ ] Charts: Most quoted routes, profitability

### Week 6: Testing & Launch

**Day 1-2: QA Testing**
- [ ] Test with 50+ rate entries
- [ ] Verify quote calculation accuracy
- [ ] Test bulk import with 100+ lines
- [ ] Performance: Query time <500ms

**Day 3: Customer Testing**
- [ ] Beta with 3-5 customers
- [ ] Real freight rate data from customers
- [ ] Collect feedback: UI/UX, accuracy, missing features

**Day 4-5: Launch**
- [ ] Marketing: Email campaign to TCI/Allcargo networks
- [ ] Trade show: Logistics Tech Summit (April 15-17)
- [ ] Launch webinar: "Build Smart Rate Cards in 10 Minutes"

---

## PART 5: PRICING & POSITIONING

### Tier 2: Professional (Includes Rate Card)
- **Price**: ₹79,999/month
- **Features**: 
  - OCR (unlimited)
  - Rate Card builder (unlimited cards)
  - Quote calculator (API access)
  - 5 users
  - Email support
- **Target**: Small-mid 3PLs (10-50 employees)

### Use Cases
1. **TCI Franchise** (10 franchises sharing 1 master rate card)
2. **Regional 3PL** (5 distribution centers with route-specific rates)
3. **Seasonal shipper** (different rates for peak vs off-season)

---

## PART 6: COMPETITIVE ADVANTAGE

### vs. Locus
- **Locus**: ₹200K+/month, enterprise-only
- **Our advantage**: ₹80K/month, SME-friendly, built-in quote calculator

### vs. Excel/Manual
- **Manual**: 15-30 min per quote, error-prone
- **Our advantage**: <1 second per quote, version control, analytics

### vs. Other TMS
- **Others**: Rate cards limited to pre-built templates
- **Our advantage**: Full flexibility, custom fields, bulk import

---

## PART 7: LAUNCH MARKETING

### Channel 1: Email Campaign (TCI/Allcargo Networks)
- Subject: "Stop losing money on freight pricing negotiation"
- Body: "Manage 1000+ rates in seconds with FreightFlow Rate Card"
- CTA: "Free 30-day trial + rate card template"
- Expected: 100 opens → 15-20 signups

### Channel 2: Trade Show (Week 5)
- **Event**: Logistics Tech Summit
- **Demo**: Live rate card builder + quote calculator
- **Give-away**: Free ₹50K worth of rate card setup (for 10 customers)
- **Expected**: 20-30 leads → 8-12 conversions

### Channel 3: LinkedIn Campaign
- Post: "How 3PLs can stop burning money on wrong pricing"
- Case study: "Regional 3PL increased profit margin by 8% with rate optimization"
- Tag: 50 3PL founders
- Expected: 30+ conversations → 8-10 meetings

### Channel 4: Partnerships
- Target: CargoNet, TruckSpot, other TMS platforms
- Offer: "White-label Rate Card module for your SME tier customers"
- Expected: 1-2 partnerships → 20-30 leads

---

## PART 8: SUCCESS METRICS

### Acquisition
- **Sign-ups**: 40-50 beta users
- **Conversions**: 25-40 paying customers by end of week 6
- **MRR**: ₹25-35L (40 customers @ ₹60-90K/month)
- **CAC**: ₹5-8K per customer

### Product Quality
- **Quote accuracy**: ≥ 95% (matches manual calculations)
- **API response time**: <500ms for quote generation
- **Import success rate**: ≥ 98% (bulk imports)

### Customer Satisfaction
- **NPS**: Target 45+
- **Feature adoption**: ≥ 70% of customers use quote calculator
- **Support tickets**: <1 per customer (most self-serve)

---

## PART 9: TECHNICAL DEBT & IMPROVEMENTS

### Post-Launch (Week 7+)
- [ ] Fuzzy matching for route names (Mumbai vs "Bombay")
- [ ] Seasonal rate variations (peak/off-season pricing)
- [ ] Customer-specific rates (different pricing per shipper)
- [ ] Rate card versioning (timeline of changes)
- [ ] Profit analysis per route (cost vs rate comparison)
- [ ] Mobile app support (rate lookup without browser)

---

## GO / NO-GO CRITERIA

✅ **Green (PROCEED)** if:
- OCR Phase complete & 10+ customers engaged
- Backend can handle 10K+ queries/day
- Team confident on implementation scope
- 3 customer commitments to beta test

⚠️ **Yellow (CAUTION)** if:
- OCR still < 80% accuracy (may delay)
- Resource conflicts with other projects
- Customer demand unclear

❌ **Red (HOLD)** if:
- OCR launch fails unexpectedly
- API performance issues on production
- Team bandwidth insufficient

**Current Status**: ✅ GREEN - Proceed with Phase 2 planning

